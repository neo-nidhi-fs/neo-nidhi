import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Transaction } from '@/models/Transaction';
import { canManageUser, requireAdminLikeAccess } from '@/lib/adminAccess';
import { buildRecurringDepositMaturityTransfer } from '@/jobs/recurringDepositCron';

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
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

    const accessResult = await requireAdminLikeAccess();
    const body = await req.json();
    const userId = String(body.userId || '');
    const monthlyAmount = Number(body.monthlyAmount);
    const tenureMonths = Number(body.tenureMonths);

    if (
      !userId ||
      Number.isNaN(monthlyAmount) ||
      monthlyAmount <= 0 ||
      !Number.isInteger(tenureMonths) ||
      tenureMonths <= 0
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid RD input parameters' },
        { status: 400 }
      );
    }

    const hasManagedAccess =
      accessResult.ok && canManageUser(accessResult.context, userId);
    const isSelf = session.user.id === userId;
    if (!hasManagedAccess && !isSelf) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const startDate = new Date();
    const nextDebitDate = addMonths(startDate, 1);
    const maturityDate = addMonths(startDate, tenureMonths);
    const maturityTransfer =
      tenureMonths === 1
        ? buildRecurringDepositMaturityTransfer(
            {
              monthlyAmount,
              installmentsPaid: tenureMonths,
              transferredToSavings: false,
            },
            startDate
          )
        : null;

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, savingsBalance: { $gte: monthlyAmount } },
      {
        $inc: {
          savingsBalance: -monthlyAmount + (maturityTransfer?.transferAmount || 0),
          rd: monthlyAmount - (maturityTransfer?.transferAmount || 0),
        },
        $push: {
          recurringDeposits: {
            monthlyAmount,
            tenureMonths,
            installmentsPaid: 1,
            startDate,
            nextDebitDate,
            maturityDate,
            status: tenureMonths === 1 ? 'completed' : 'active',
            lastDebitDate: startDate,
            missedInstallments: 0,
            transferredToSavings: maturityTransfer?.transferredToSavings ?? false,
            maturityTransferredAmount:
              maturityTransfer?.maturityTransferredAmount ?? 0,
            maturityTransferredAt: maturityTransfer?.maturityTransferredAt ?? null,
            createdAt: startDate,
            updatedAt: startDate,
          },
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Insufficient savings balance' },
        { status: 400 }
      );
    }

    const rdPlan =
      updatedUser.recurringDeposits[updatedUser.recurringDeposits.length - 1];
    await Transaction.create({
      userId,
      type: 'rd',
      amount: monthlyAmount,
      date: startDate,
      metadata: {
        recurringDepositId: rdPlan?._id?.toString(),
        monthlyAmount,
        tenureMonths,
        installmentNumber: 1,
        nextDebitDate: rdPlan?.nextDebitDate?.toISOString(),
        maturityDate: rdPlan?.maturityDate?.toISOString(),
        source: 'rd_creation',
      },
    });

    if (maturityTransfer && maturityTransfer.transferAmount > 0) {
      await Transaction.create({
        userId,
        type: 'deposit',
        amount: maturityTransfer.transferAmount,
        date: startDate,
        metadata: {
          recurringDepositId: rdPlan?._id?.toString(),
          monthlyAmount,
          tenureMonths,
          installmentNumber: 1,
          maturityTransferredAt: startDate.toISOString(),
          source: 'rd_maturity_transfer',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `RD created and first installment of ₹${monthlyAmount} debited successfully`,
      data: rdPlan,
      balances: {
        savingsBalance: updatedUser.savingsBalance,
        rdBalance: updatedUser.rd,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
