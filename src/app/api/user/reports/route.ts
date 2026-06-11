import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Transaction } from '@/models/Transaction';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

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

    const user = await User.findById(session.user.id)
      .select(
        'name savingsBalance fd rd loanBalance accruedSavingInterest accruedFdInterest accruedRdInterest accruedLoanInterest'
      )
      .lean();
    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const transactions = await Transaction.find({ userId: user._id })
      .select('type amount date')
      .lean();

    const monthlyTrends: { [key: string]: number } = {};
    const monthlySavings: { [key: string]: number } = {};
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
      monthlyTrends[monthKey] = 0;
      monthlySavings[monthKey] = 0;
    }

    const transactionsByType = {
      deposit: 0,
      withdrawal: 0,
      loan: 0,
      repayment: 0,
      fd: 0,
      rd: 0,
      withdrawal_fd: 0,
    };

    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let totalLoans = 0;
    let totalRepayments = 0;
    let totalFdDeposits = 0;
    let totalRdDeposits = 0;
    let totalFdWithdrawals = 0;
    let recentTransactionCount = 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    for (const transaction of transactions) {
      const amount = transaction.amount || 0;
      const date = new Date(transaction.date);
      const monthKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });

      if (monthKey in monthlyTrends) {
        monthlyTrends[monthKey]++;
      }
      if (date >= sixMonthsAgo) {
        recentTransactionCount++;
      }

      switch (transaction.type) {
        case 'deposit':
          totalDeposits += amount;
          transactionsByType.deposit++;
          monthlySavings[monthKey] += amount;
          break;
        case 'withdrawal':
          totalWithdrawals += amount;
          transactionsByType.withdrawal++;
          monthlySavings[monthKey] -= amount;
          break;
        case 'loan':
          totalLoans += amount;
          transactionsByType.loan++;
          break;
        case 'repayment':
          totalRepayments += amount;
          transactionsByType.repayment++;
          break;
        case 'fd':
          totalFdDeposits += amount;
          transactionsByType.fd++;
          break;
        case 'rd':
          totalRdDeposits += amount;
          transactionsByType.rd++;
          break;
        case 'withdrawal_fd':
          totalFdWithdrawals += amount;
          transactionsByType.withdrawal_fd++;
          break;
      }
    }

    // Interest breakdown
    const interestBreakdown = {
      savingsInterest: user.accruedSavingInterest || 0,
      fdInterest: user.accruedFdInterest || 0,
      rdInterest: user.accruedRdInterest || 0,
      loanInterest: user.accruedLoanInterest || 0,
    };

    const totalInterestEarned =
      (user.accruedSavingInterest || 0) +
      (user.accruedFdInterest || 0) +
      (user.accruedRdInterest || 0);
    const totalInterestAccrued = user.accruedLoanInterest || 0;

    return Response.json({
      success: true,
      data: {
        user: {
          name: user.name,
          savingsBalance: user.savingsBalance,
          fdBalance: user.fd,
          rdBalance: user.rd || 0,
          loanBalance: user.loanBalance,
        },
        metrics: {
          totalDeposits,
          totalWithdrawals,
          totalLoans,
          totalRepayments,
          totalFdDeposits,
          totalRdDeposits,
          totalFdWithdrawals,
          totalInterestEarned,
          totalInterestAccrued,
          netSavings: totalDeposits - totalWithdrawals,
          netFd: totalFdDeposits - totalFdWithdrawals,
          netRd: totalRdDeposits,
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
