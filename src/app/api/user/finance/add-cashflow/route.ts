import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { CashFlow } from '@/models/CashFlow';
import { enforceFinanceFeatureEnabled } from '@/lib/featureFlags';
import { calculateEmiPaymentSplit } from '@/lib/emi';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';

function isCreditCardLiability(liability: {
  type?: string;
  note?: string | null;
}): boolean {
  const searchable = `${liability.type || ''} ${liability.note || ''}`
    .toLowerCase()
    .trim();
  return (
    searchable.includes('credit card') ||
    searchable.includes('creditcard') ||
    searchable === 'card'
  );
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

    const body = await req.json();
    const { date, type, category, amount, source, liabilityId, note, paymentSource } =
      body;

    const validPaymentSources = ['account', 'cash', 'card', 'credit_card'] as const;

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

    // Required for both income and expense so totals can be tracked by mode.
    if (paymentSource == null || paymentSource === '') {
      return NextResponse.json(
        { success: false, error: 'Payment type is required' },
        { status: 400 }
      );
    }

    if (!validPaymentSources.includes(paymentSource)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment source' },
        { status: 400 }
      );
    }
    const resolvedPaymentSource = paymentSource === 'credit_card' ? 'card' : paymentSource;

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

    const isCreditCardPaymentCategory =
      String(category).trim().toLowerCase() === 'credit card payments';

    let resolvedLiabilityId = liabilityId || '';

    // Auto-resolve credit card liability when user records a credit-card payment.
    if (
      type === 'expense' &&
      isCreditCardPaymentCategory &&
      !resolvedLiabilityId
    ) {
      const matchingCreditCardLiabilities = (user.liabilities || []).filter(
        (liability) =>
          liability.status === 'active' &&
          (liability.amount || 0) > 0 &&
          isCreditCardLiability(liability)
      );

      if (matchingCreditCardLiabilities.length === 1) {
        resolvedLiabilityId =
          matchingCreditCardLiabilities[0]._id.toString();
      } else if (matchingCreditCardLiabilities.length > 1) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Multiple active credit card liabilities found. Please select one in "Apply to Loan".',
          },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            error:
              'No active credit card liability found to deduct this payment.',
          },
          { status: 400 }
        );
      }
    }

    // Apply cashflow to liability if provided/resolved
    if (resolvedLiabilityId) {
      const liabilityIndex = user.liabilities.findIndex(
        (l) => l._id.toString() === resolvedLiabilityId
      );
      if (liabilityIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Linked liability not found' },
          { status: 404 }
        );
      }

      const existingLiability = user.liabilities[liabilityIndex];
      const outstandingAmount = existingLiability.amount || 0;
      const { principalPaid } = calculateEmiPaymentSplit(
        outstandingAmount,
        existingLiability.interestRate,
        amount
      );
      const remaining = Math.max(0, outstandingAmount - principalPaid);

      user.liabilities[liabilityIndex].amount = remaining;
      user.liabilities[liabilityIndex].status =
        remaining === 0 ? 'paid_off' : 'active';
      user.liabilities[liabilityIndex].metadata = {
        ...user.liabilities[liabilityIndex].metadata,
        lastPayment: principalPaid,
        lastPaymentDate: new Date(),
      };

      user.loanBalance = Math.max(0, (user.loanBalance || 0) - principalPaid);
      await user.save();
    }

    const createdCashFlow = await CashFlow.create({
      user: user._id,
      date: new Date(date),
      type,
      category,
      amount,
      source,
      liabilityId: resolvedLiabilityId || null,
      paymentSource: resolvedPaymentSource,
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
