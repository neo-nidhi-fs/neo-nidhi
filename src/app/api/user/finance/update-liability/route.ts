import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { CashFlow } from '@/models/CashFlow';
import { enforceFinanceFeatureEnabled } from '@/lib/featureFlags';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
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
    const {
      liabilityId,
      type,
      amount,
      interestRate,
      startDate,
      termMonths,
      additionalCharges,
      dueDate,
      status,
      metadata,
      paymentAmount,
      close,
    } = body;

    if (!liabilityId) {
      return NextResponse.json(
        { success: false, error: 'Liability ID required' },
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
    if (featureFlagError) {
      return featureFlagError;
    }

    // Ensure liabilities array exists for backward compatibility
    if (!user.liabilities) {
      user.liabilities = [];
    }

    const liabilityIndex = user.liabilities.findIndex(
      (l) => l._id.toString() === liabilityId
    );
    if (liabilityIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Liability not found' },
        { status: 404 }
      );
    }

    // Handle part payment and closure
    if (paymentAmount !== undefined && paymentAmount > 0) {
      const currentAmount = user.liabilities[liabilityIndex].amount;
      const remaining = Math.max(0, currentAmount - paymentAmount);
      user.liabilities[liabilityIndex].amount = remaining;
      user.liabilities[liabilityIndex].status =
        remaining === 0 ? 'paid_off' : 'active';
      user.liabilities[liabilityIndex].metadata = {
        ...user.liabilities[liabilityIndex].metadata,
        lastPayment: paymentAmount,
        lastPaymentDate: new Date(),
      };

      user.loanBalance = Math.max(0, user.loanBalance - paymentAmount);

      await CashFlow.create({
        user: user._id,
        date: new Date(),
        type: 'expense',
        category: 'loan_repayment',
        amount: paymentAmount,
        source: 'liability',
        note: `Part payment for ${user.liabilities[liabilityIndex].type}`,
      });
    }

    if (close) {
      user.liabilities[liabilityIndex].status = 'paid_off';
      user.liabilities[liabilityIndex].amount = 0;
    }

    // Update liability fields if provided
    if (type !== undefined) user.liabilities[liabilityIndex].type = type;
    if (amount !== undefined) user.liabilities[liabilityIndex].amount = amount;
    if (interestRate !== undefined)
      user.liabilities[liabilityIndex].interestRate = interestRate;
    if (startDate !== undefined)
      user.liabilities[liabilityIndex].metadata = {
        ...user.liabilities[liabilityIndex].metadata,
        startDate: startDate || null,
      };
    if (termMonths !== undefined)
      user.liabilities[liabilityIndex].metadata = {
        ...user.liabilities[liabilityIndex].metadata,
        termMonths: termMonths || 0,
      };
    if (additionalCharges !== undefined)
      user.liabilities[liabilityIndex].metadata = {
        ...user.liabilities[liabilityIndex].metadata,
        additionalCharges: additionalCharges || 0,
      };
    if (dueDate !== undefined)
      user.liabilities[liabilityIndex].dueDate = dueDate
        ? new Date(dueDate)
        : undefined;
    if (status !== undefined) user.liabilities[liabilityIndex].status = status;
    if (metadata !== undefined)
      user.liabilities[liabilityIndex].metadata = {
        ...user.liabilities[liabilityIndex].metadata,
        ...metadata,
      };

    user.liabilities[liabilityIndex].updatedAt = new Date();

    await user.save();

    return NextResponse.json({
      success: true,
      data: user.liabilities[liabilityIndex],
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
