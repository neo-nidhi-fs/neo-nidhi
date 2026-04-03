import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { CashFlow } from '@/models/CashFlow';
import { enforceFinanceFeatureEnabled } from '@/lib/featureFlags';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

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

    const body = await req.json();
    const { date, type, category, amount, source, liabilityId, note, paymentSource } =
      body;

    const validPaymentSources = ['account', 'credit_card', 'cash'] as const;

    // Validation
    if (!date || !type || !category || amount === undefined || !source) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (liabilityId && type !== 'expense') {
      return NextResponse.json(
        { success: false, error: 'Liability linked payments must be expenses' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const validTypes = ['income', 'expense'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid cashflow type: ${type}` },
        { status: 400 }
      );
    }

    /** Optional: only persist when client sends a valid value (no server default). */
    let resolvedPaymentSource: 'account' | 'credit_card' | 'cash' | undefined;
    if (type === 'expense' && paymentSource != null && paymentSource !== '') {
      if (!validPaymentSources.includes(paymentSource)) {
        return NextResponse.json(
          { success: false, error: 'Invalid payment source' },
          { status: 400 }
        );
      }
      resolvedPaymentSource = paymentSource;
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const featureFlagError = enforceFinanceFeatureEnabled(user);
    if (featureFlagError) {
      return featureFlagError;
    }

    // Apply cashflow to liability if provided
    if (liabilityId) {
      const liabilityIndex = user.liabilities.findIndex(
        (l) => l._id.toString() === liabilityId
      );
      if (liabilityIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Linked liability not found' },
          { status: 404 }
        );
      }

      const existingLiability = user.liabilities[liabilityIndex];
      const paymentAmount = Math.min(amount, existingLiability.amount || 0);
      const remaining = Math.max(0, (existingLiability.amount || 0) - amount);

      user.liabilities[liabilityIndex].amount = remaining;
      user.liabilities[liabilityIndex].status =
        remaining === 0 ? 'paid_off' : 'active';
      user.liabilities[liabilityIndex].metadata = {
        ...user.liabilities[liabilityIndex].metadata,
        lastPayment: paymentAmount,
        lastPaymentDate: new Date(),
      };

      user.loanBalance = Math.max(0, (user.loanBalance || 0) - paymentAmount);
      await user.save();
    }

    const createdCashFlow = await CashFlow.create({
      user: user._id,
      date: new Date(date),
      type,
      category,
      amount,
      source,
      liabilityId: liabilityId || null,
      ...(resolvedPaymentSource
        ? { paymentSource: resolvedPaymentSource }
        : {}),
      note: note || null,
    });

    return NextResponse.json(
      {
        success: true,
        data: createdCashFlow,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
