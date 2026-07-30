import { createHash } from 'crypto';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { CashFlow } from '@/models/CashFlow';
import { enforceFinanceFeatureEnabled } from '@/lib/featureFlags';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';
import type { ParsedTransaction } from '@/types/bankStatement';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    const featureFlagError = enforceFinanceFeatureEnabled(user);
    if (featureFlagError) return featureFlagError;

    const body = await req.json();
    const transactions: ParsedTransaction[] = body.transactions ?? [];

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ success: false, error: 'No transactions provided' }, { status: 400 });
    }
    if (transactions.length > 1000) {
      return NextResponse.json({ success: false, error: 'Too many transactions (max 1000 per import)' }, { status: 400 });
    }

    const userId = session.user.id;
    const docs = transactions.map((t) => {
      const fingerprint = createHash('sha256')
        .update(`stmt:${userId}|${t.date}|${t.amount}|${t.source}`)
        .digest('hex');
      return {
        user: userId,
        date: new Date(t.date),
        type: t.type,
        category: t.category,
        amount: t.amount,
        source: t.source,
        paymentSource: t.paymentSource,
        note: t.description,
        smsFingerprint: fingerprint,
      };
    });

    let imported = 0;
    let skipped = 0;

    // insertMany with ordered:false continues past duplicate-key errors
    try {
      const result = await CashFlow.insertMany(docs, { ordered: false });
      imported = result.length;
      skipped = docs.length - imported;
    } catch (insertErr: unknown) {
      // Partial insert: some docs succeeded, some hit the unique fingerprint index
      const mongoError = insertErr as { insertedDocs?: unknown[]; writeErrors?: unknown[] };
      if (mongoError?.insertedDocs !== undefined) {
        imported = mongoError.insertedDocs?.length ?? 0;
        skipped = docs.length - imported;
      } else {
        throw insertErr;
      }
    }

    return NextResponse.json({ success: true, imported, skipped });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
