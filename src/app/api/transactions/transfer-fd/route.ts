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

    // Check user has sufficient savings balance
    if (user.savingsBalance < amount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient savings balance' },
        { status: 400 }
      );
    }

    // Transfer amount from savings to FD
    await User.findByIdAndUpdate(userId, {
      $inc: { savingsBalance: -amount, fd: amount },
    });

    // Create transactions
    await Transaction.create({
      userId,
      type: 'withdrawal',
      amount,
      date: new Date(),
    });

    await Transaction.create({
      userId,
      type: 'fd',
      amount,
      date: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `₹${amount} transferred to Fixed Deposit successfully`,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
