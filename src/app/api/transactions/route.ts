import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Transaction } from '@/models/Transaction';
import { User } from '@/models/User';
import { recalculateBalances } from '@/utils/recalculateBalance';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { userId, type, amount } = body;

    // Validation
    if (!userId || !type || amount === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const validTypes = ['deposit', 'withdrawal', 'loan', 'repayment', 'fd'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid transaction type: ${type}` },
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

    // Validation for specific transaction types
    if (type === 'withdrawal') {
      const currentSavings = await recalculateBalances(userId);
      if (currentSavings.savingsBalance < amount) {
        return NextResponse.json(
          { success: false, error: 'Insufficient savings balance' },
          { status: 400 }
        );
      }
    }

    if (type === 'repayment') {
      const currentBalances = await recalculateBalances(userId);
      if (currentBalances.loanBalance < amount) {
        return NextResponse.json(
          { success: false, error: 'Repayment amount exceeds loan balance' },
          { status: 400 }
        );
      }
    }

    // Create transaction
    const transaction = new Transaction({
      userId,
      type,
      amount,
      date: new Date(),
    });
    await transaction.save();

    // Recalculate balances from all transactions
    const newBalances = await recalculateBalances(userId);

    // Update user balances
    user.savingsBalance = newBalances.savingsBalance;
    user.fd = newBalances.fdBalance;
    user.loanBalance = newBalances.loanBalance;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        data: transaction,
        balances: {
          savingsBalance: user.savingsBalance,
          fdBalance: user.fd,
          loanBalance: user.loanBalance,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error creating transaction:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const transactions = await Transaction.find({}).sort({ date: -1 }); // latest first
    return NextResponse.json({ success: true, data: transactions });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
