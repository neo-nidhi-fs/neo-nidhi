import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createHash } from 'crypto';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { CashFlow } from '@/models/CashFlow';
import { enforceFinanceFeatureEnabled } from '@/lib/featureFlags';
import { parseFinanceSms } from '@/lib/smsFinanceParser';

type SmsPayload = {
  id?: string;
  sender?: string;
  body?: string;
  receivedAt?: string;
  messageId?: string;
};

type IngestSmsRequest = {
  messages?: SmsPayload[];
  deviceSyncedAtMs?: number;
};

type ParsedMessage = {
  message: SmsPayload;
  parsed: ReturnType<typeof parseFinanceSms>;
  receivedAtMs: number;
};

function escapeForRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractSmsReferences(payload: SmsPayload): string[] {
  const raw = `${payload.sender || ''} ${payload.body || ''}`;
  const patterns = [
    /\b(?:utr|rrn|txn(?:\s*id)?|transaction(?:\s*id)?|ref(?:erence)?(?:\s*no)?|upi(?:\s*ref(?:erence)?)?)\s*[:\-]?\s*([a-z0-9\-]{6,})\b/gi,
    /\b([0-9]{12})\b/g,
  ];

  const refs = new Set<string>();
  for (const pattern of patterns) {
    let match: RegExpExecArray | null = pattern.exec(raw);
    while (match) {
      refs.add(
        String(match[1] || '')
          .toLowerCase()
          .trim()
      );
      match = pattern.exec(raw);
    }
  }
  return Array.from(refs).filter(Boolean).slice(0, 5);
}

function isTransferLikeText(payload: SmsPayload): boolean {
  const lower = `${payload.sender || ''} ${payload.body || ''}`.toLowerCase();
  return (
    lower.includes('transfer') ||
    lower.includes('transferred') ||
    lower.includes('to a/c') ||
    lower.includes('to account') ||
    lower.includes('from a/c') ||
    lower.includes('from account')
  );
}
function isTransferPromotionLikeText(payload: SmsPayload): boolean {
  const lower = `${payload.sender || ''} ${payload.body || ''}`.toLowerCase();
  return (
    lower.includes('transfer') &&
    (lower.includes('offer') ||
      lower.includes('promo') ||
      lower.includes('Apply') ||
      lower.includes('Eligible') ||
      lower.includes('pre-approved') ||
      lower.includes('2 LOANS. 1 Processing Fee') ||
      lower.includes('promotion'))
  );
}

function buildMessageHash(payload: SmsPayload): string {
  const raw = `${payload.id || payload.messageId || ''}|${payload.sender || ''}|${payload.receivedAt || ''}|${payload.body || ''}`;
  return createHash('sha256').update(raw).digest('hex');
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = (await req.json()) as IngestSmsRequest;
    const messages: SmsPayload[] = Array.isArray(body?.messages)
      ? body.messages
      : [];
    if (!messages.length) {
      return NextResponse.json(
        { success: false, error: 'messages[] is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const featureFlagError = enforceFinanceFeatureEnabled(user);
    if (featureFlagError) return featureFlagError;

    const createdIds: string[] = [];
    let skippedNonFinance = 0;
    let skippedDuplicates = 0;
    let skippedTransfers = 0;

    const parsedMessages: ParsedMessage[] = [];
    for (const message of messages) {
      const parsed = parseFinanceSms(
        String(message.body || ''),
        String(message.sender || '')
      );
      if (!parsed) {
        skippedNonFinance += 1;
        continue;
      }
      parsedMessages.push({
        message,
        parsed,
        receivedAtMs: message.receivedAt
          ? new Date(message.receivedAt).getTime()
          : Date.now(),
      });
    }

    const skipIndexes = new Set<number>();
    const transferWindowMs = 60 * 60 * 1000;
    for (let i = 0; i < parsedMessages.length; i += 1) {
      if (skipIndexes.has(i)) continue;
      const left = parsedMessages[i];
      if (!left.parsed || !isTransferLikeText(left.message)) continue;

      for (let j = i + 1; j < parsedMessages.length; j += 1) {
        if (skipIndexes.has(j)) continue;
        const right = parsedMessages[j];
        if (
          !right.parsed ||
          !isTransferLikeText(right.message) ||
          !isTransferPromotionLikeText(right.message)
        )
          continue;
        if (left.parsed.amount !== right.parsed.amount) continue;
        if (left.parsed.type === right.parsed.type) continue;
        if (Math.abs(left.receivedAtMs - right.receivedAtMs) > transferWindowMs)
          continue;

        skipIndexes.add(i);
        skipIndexes.add(j);
        skippedTransfers += 2;
        break;
      }
    }

    for (let index = 0; index < parsedMessages.length; index += 1) {
      if (skipIndexes.has(index)) continue;
      const { message, parsed } = parsedMessages[index];
      if (!parsed) continue;
      const hash = buildMessageHash(message);
      const dedupeTag = `[sms-hash:${hash}]`;
      const references = extractSmsReferences(message);
      const referenceTags = references.map((ref) => `[sms-ref:${ref}]`);
      const dedupeNeedles = [dedupeTag, ...referenceTags];
      const dedupeRegexes = dedupeNeedles.map(
        (tag) => new RegExp(escapeForRegex(tag))
      );

      const smsDeviceTimeMs = message.receivedAt
        ? new Date(message.receivedAt).getTime()
        : null;

      const duplicateByFingerprint = await CashFlow.findOne({
        user: user._id,
        smsFingerprint: hash,
      })
        .select('_id')
        .lean();

      if (duplicateByFingerprint) {
        skippedDuplicates += 1;
        continue;
      }

      const receivedDate = message.receivedAt
        ? new Date(message.receivedAt)
        : new Date();
      const dayStart = new Date(receivedDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(receivedDate);
      dayEnd.setHours(23, 59, 59, 999);

      const duplicateByAmountDateAndRef = await CashFlow.findOne({
        user: user._id,
        date: { $gte: dayStart, $lte: dayEnd },
        amount: parsed.amount,
        $or: [
          { note: { $in: dedupeRegexes } },
          ...(references.length
            ? [{ smsReferenceKeys: { $in: references } }]
            : []),
        ],
      })
        .select('_id')
        .lean();

      if (duplicateByAmountDateAndRef) {
        skippedDuplicates += 1;
        continue;
      }

      const created = await CashFlow.create({
        user: user._id,
        date: receivedDate,
        type: parsed.type,
        category: parsed.category,
        amount: parsed.amount,
        source: parsed.source,
        liabilityId: null,
        paymentSource: parsed.paymentSource,
        note: `${parsed.note} ${[dedupeTag, ...referenceTags].join(' ')}`,
        smsFingerprint: hash,
        smsDeviceTimeMs,
        smsReferenceKeys: references,
      });

      createdIds.push(String(created._id));
    }

    return NextResponse.json({
      success: true,
      data: {
        createdCount: createdIds.length,
        createdIds,
        skippedNonFinance,
        skippedDuplicates,
        skippedTransfers,
        deviceSyncedAtMs:
          typeof body?.deviceSyncedAtMs === 'number'
            ? body.deviceSyncedAtMs
            : Date.now(),
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
