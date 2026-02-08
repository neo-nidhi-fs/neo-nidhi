import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Transaction } from '@/models/Transaction';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch user transactions
    const transactions = await Transaction.find({ userId: user._id });

    // Calculate key metrics
    const totalDeposits = transactions
      .filter((t) => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = transactions
      .filter((t) => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalLoans = transactions
      .filter((t) => t.type === 'loan')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalRepayments = transactions
      .filter((t) => t.type === 'repayment')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalFdDeposits = transactions
      .filter((t) => t.type === 'fd')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalFdWithdrawals = transactions
      .filter((t) => t.type === 'withdrawal_fd')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalInterestEarned =
      user.accruedSavingInterest + user.accruedFdInterest;
    const totalInterestAccrued = user.accruedLoanInterest;

    // Transaction breakdown
    const transactionsByType = {
      deposit: transactions.filter((t) => t.type === 'deposit').length,
      withdrawal: transactions.filter((t) => t.type === 'withdrawal').length,
      loan: transactions.filter((t) => t.type === 'loan').length,
      repayment: transactions.filter((t) => t.type === 'repayment').length,
      fd: transactions.filter((t) => t.type === 'fd').length,
      withdrawal_fd: transactions.filter((t) => t.type === 'withdrawal_fd')
        .length,
    };

    // Monthly transaction trends (last 12 months)
    const monthlyTrends: { [key: string]: number } = {};
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
      monthlyTrends[monthKey] = 0;
    }

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
      if (monthKey in monthlyTrends) {
        monthlyTrends[monthKey]++;
      }
    });

    // Monthly savings trends
    const monthlySavings: { [key: string]: number } = {};
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
      monthlySavings[monthKey] = 0;
    }

    transactions
      .filter((t) => ['deposit', 'withdrawal'].includes(t.type))
      .forEach((t) => {
        const date = new Date(t.date);
        const monthKey = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
        });
        if (monthKey in monthlySavings) {
          if (t.type === 'deposit') {
            monthlySavings[monthKey] += t.amount;
          } else {
            monthlySavings[monthKey] -= t.amount;
          }
        }
      });

    // Interest breakdown
    const interestBreakdown = {
      savingsInterest: user.accruedSavingInterest,
      fdInterest: user.accruedFdInterest,
      loanInterest: user.accruedLoanInterest,
    };

    // Recent transactions (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentTransactionCount = transactions.filter(
      (t) => new Date(t.date) >= sixMonthsAgo
    ).length;

    return Response.json({
      success: true,
      data: {
        user: {
          name: user.name,
          savingsBalance: user.savingsBalance,
          fdBalance: user.fd,
          loanBalance: user.loanBalance,
        },
        metrics: {
          totalDeposits,
          totalWithdrawals,
          totalLoans,
          totalRepayments,
          totalFdDeposits,
          totalFdWithdrawals,
          totalInterestEarned,
          totalInterestAccrued,
          netSavings: totalDeposits - totalWithdrawals,
          netFd: totalFdDeposits - totalFdWithdrawals,
          netLoan: totalLoans - totalRepayments,
          totalTransactions: transactions.length,
          recentTransactionCount,
        },
        transactionsByType,
        monthlyTrends,
        monthlySavings,
        interestBreakdown,
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch reports',
      },
      { status: 500 }
    );
  }
}
