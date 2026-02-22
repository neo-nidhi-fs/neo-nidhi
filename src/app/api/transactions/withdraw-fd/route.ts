import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Transaction } from '@/models/Transaction';
import { Settings } from '@/models/Settings';

const FD_LOCK_IN_PERIOD = 3 * 365 * 24 * 60 * 60 * 1000; // 3 years in milliseconds

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

    // Get all FD transactions for the user
    const fdTransactions = await Transaction.find(
      { userId, type: 'fd' },
      {},
      { sort: { date: 1 } }
    );

    if (fdTransactions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No FD transactions found' },
        { status: 400 }
      );
    }

    // Calculate mature and premature amounts
    const now = Date.now();
    let matureAmount = 0;
    let prematureAmount = 0;
    const matureTransactions: typeof fdTransactions = [];
    const prematureTransactions: typeof fdTransactions = [];

    for (const tx of fdTransactions) {
      const txAge = now - new Date(tx.date).getTime();
      if (txAge >= FD_LOCK_IN_PERIOD) {
        matureAmount += tx.amount;
        matureTransactions.push(tx);
      } else {
        prematureAmount += tx.amount;
        prematureTransactions.push(tx);
      }
    }

    // Check if requested amount is available
    const totalAvailable = matureAmount + prematureAmount;
    if (amount > totalAvailable) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient FD balance. Total: ₹${totalAvailable.toFixed(2)}, Mature: ₹${matureAmount.toFixed(2)}, Premature: ₹${prematureAmount.toFixed(2)}`,
        },
        { status: 400 }
      );
    }

    // Get settings for interest rates or use defaults
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if they don't exist
      settings = await Settings.create({
        savingsInterestRate: 3.5,
        loanInterestRate: 12,
        fdInterestRate: 8,
        fdPrematureInterestRate: 3.5,
      });
    }

    // Determine withdrawal type and calculate interest
    let interestEarned = 0;
    let isMatureWithdrawal = true;

    if (amount <= matureAmount) {
      // Full withdrawal from mature FD - pay full accrued interest
      interestEarned = user.accruedFdInterest || 0;
    } else {
      // Partial mature + Premature withdrawal
      isMatureWithdrawal = false;
      // Calculate proportional accrued interest
      const proportionalInterest =
        ((user.accruedFdInterest || 0) * amount) / user.fd;

      const prematurePortion = amount - matureAmount;
      const prematureRatio = prematurePortion / amount;

      // Apply penalty to the premature portion's interest
      const penaltyReduction =
        proportionalInterest *
        prematureRatio *
        ((settings.fdInterestRate - settings.fdPrematureInterestRate) /
          settings.fdInterestRate);

      interestEarned = proportionalInterest - penaltyReduction;
    }

    // Update user's FD and savings balance
    const withdrawalAmount = amount + interestEarned;
    await User.findByIdAndUpdate(userId, {
      $inc: {
        fd: -amount,
        savingsBalance: withdrawalAmount,
        accruedFdInterest: -interestEarned,
      },
    });

    // Create transactions
    await Transaction.create({
      userId,
      type: 'withdrawal_fd',
      amount,
      date: new Date(),
    });

    if (interestEarned > 0) {
      await Transaction.create({
        userId,
        type: 'interest_fd',
        amount: interestEarned,
        date: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `FD withdrawal successful. Principal: ₹${amount.toFixed(2)}, Interest: ₹${interestEarned.toFixed(2)}, Total: ₹${withdrawalAmount.toFixed(2)}`,
      data: {
        principalWithdrawn: amount,
        interestEarned,
        totalWithdrawn: withdrawalAmount,
        matureAmount,
        prematureAmount,
        isMatureWithdrawal,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
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

    // Get all FD transactions for the user
    const fdTransactions = await Transaction.find(
      { userId, type: 'fd' },
      {},
      { sort: { date: 1 } }
    );

    // Calculate mature and premature amounts
    const now = Date.now();
    let matureAmount = 0;
    let prematureAmount = 0;
    const matureTransactionDetails: {
      amount: number;
      date: Date;
      yearsOld: number;
    }[] = [];
    const prematureTransactionDetails: {
      amount: number;
      date: Date;
      yearsOld: number;
    }[] = [];

    for (const tx of fdTransactions) {
      const txAge = now - new Date(tx.date).getTime();
      const yearsOld = txAge / (365 * 24 * 60 * 60 * 1000);

      if (txAge >= FD_LOCK_IN_PERIOD) {
        matureAmount += tx.amount;
        matureTransactionDetails.push({
          amount: tx.amount,
          date: tx.date,
          yearsOld,
        });
      } else {
        prematureAmount += tx.amount;
        prematureTransactionDetails.push({
          amount: tx.amount,
          date: tx.date,
          yearsOld,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalFd: user.fd,
        matureAmount,
        prematureAmount,
        matureTransactions: matureTransactionDetails,
        prematureTransactions: prematureTransactionDetails,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
