import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Transaction } from '@/models/Transaction';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { userId, amount } = body;

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid input parameters' },
        { status: 400 }
      );
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has loan
    if (user.loanBalance <= 0) {
      return NextResponse.json(
        { success: false, error: 'No active loan' },
        { status: 400 }
      );
    }

    // Check user has sufficient savings balance
    if (user.savingsBalance < amount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient savings balance' },
        { status: 400 }
      );
    }

    // Check amount doesn't exceed loan balance
    const paymentAmount = Math.min(amount, user.loanBalance);

    // Update balances
    await User.findByIdAndUpdate(userId, {
      $inc: {
        savingsBalance: -paymentAmount,
        loanBalance: -paymentAmount,
      },
    });

    // Create transaction
    await Transaction.create({
      userId,
      type: 'repayment',
      amount: paymentAmount,
      date: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Loan repayment of ₹${paymentAmount} completed successfully`,
      paidAmount: paymentAmount,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
