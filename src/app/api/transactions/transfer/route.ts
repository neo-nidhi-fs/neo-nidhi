import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Transaction } from '@/models/Transaction';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { fromUserId, toUserName, amount } = body;
    const trimmedToUserName = toUserName?.trim();

    if (!fromUserId || !trimmedToUserName || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid input parameters' },
        { status: 400 }
      );
    }

    // Get sender
    const sender = await User.findById(fromUserId);
    if (!sender) {
      return NextResponse.json(
        { success: false, error: 'Sender not found' },
        { status: 404 }
      );
    }

    // Check sender has sufficient balance
    if (sender.savingsBalance < amount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Get receiver
    const receiver = await User.findOne({ name: trimmedToUserName });
    if (!receiver) {
      return NextResponse.json(
        { success: false, error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Transfer amount
    await User.findByIdAndUpdate(fromUserId, {
      $inc: { savingsBalance: -amount },
    });

    await User.findByIdAndUpdate(receiver._id, {
      $inc: { savingsBalance: amount },
    });

    // Create transactions
    await Transaction.create({
      userId: fromUserId,
      type: 'withdrawal',
      amount,
      date: new Date(),
    });

    await Transaction.create({
      userId: receiver._id,
      type: 'deposit',
      amount,
      date: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `₹${amount} transferred to ${receiver.name} successfully`,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
