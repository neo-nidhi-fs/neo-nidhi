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
      refs.add(String(match[1] || '').toLowerCase().trim());
      match = pattern.exec(raw);
    }
  }
  return Array.from(refs).filter(Boolean).slice(0, 5);
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
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const messages: SmsPayload[] = Array.isArray(body?.messages) ? body.messages : [];
    if (!messages.length) {
      return NextResponse.json(
        { success: false, error: 'messages[] is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const featureFlagError = enforceFinanceFeatureEnabled(user);
    if (featureFlagError) return featureFlagError;

    const createdIds: string[] = [];
    let skippedNonFinance = 0;
    let skippedDuplicates = 0;

    for (const message of messages) {
      const parsed = parseFinanceSms(
        String(message.body || ''),
        String(message.sender || '')
      );
      if (!parsed) {
        skippedNonFinance += 1;
        continue;
      }

      const hash = buildMessageHash(message);
      const dedupeTag = `[sms-hash:${hash}]`;
      const references = extractSmsReferences(message);
      const referenceTags = references.map((ref) => `[sms-ref:${ref}]`);
      const dedupeNeedles = [dedupeTag, ...referenceTags];
      const dedupeRegexes = dedupeNeedles.map((tag) => new RegExp(escapeForRegex(tag)));

      const duplicate = await CashFlow.findOne({
        user: user._id,
        source: 'sms_auto',
        note: { $in: dedupeRegexes },
      })
        .select('_id')
        .lean();

      if (duplicate) {
        skippedDuplicates += 1;
        continue;
      }

      const created = await CashFlow.create({
        user: user._id,
        date: message.receivedAt ? new Date(message.receivedAt) : new Date(),
        type: parsed.type,
        category: parsed.category,
        amount: parsed.amount,
        source: parsed.source,
        liabilityId: null,
        paymentSource: parsed.paymentSource,
        note: `${parsed.note} ${[dedupeTag, ...referenceTags].join(' ')}`,
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
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
