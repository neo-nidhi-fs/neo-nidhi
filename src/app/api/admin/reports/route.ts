import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Transaction } from '@/models/Transaction';
import { Scheme } from '@/models/Scheme';

export async function GET() {
  try {
    await dbConnect();

    // Fetch all users
    const users = await User.find({});
    const transactions = await Transaction.find({});
    const schemes = await Scheme.find({});

    // Calculate key metrics
    const totalUsers = users.length;
    const totalAdmins = users.filter((u) => u.role === 'admin').length;
    const totalNormalUsers = totalUsers - totalAdmins;

    const totalSavingsBalance = users.reduce(
      (sum, u) => sum + u.savingsBalance,
      0
    );
    const totalFdBalance = users.reduce((sum, u) => sum + u.fd, 0);
    const totalLoanBalance = users.reduce((sum, u) => sum + u.loanBalance, 0);
    const totalAccruedSavingInterest = users.reduce(
      (sum, u) => sum + u.accruedSavingInterest,
      0
    );
    const totalAccruedFdInterest = users.reduce(
      (sum, u) => sum + u.accruedFdInterest,
      0
    );
    const totalAccruedLoanInterest = users.reduce(
      (sum, u) => sum + u.accruedLoanInterest,
      0
    );

    // Transaction analysis
    const transactionsByType = {
      deposit: transactions.filter((t) => t.type === 'deposit').length,
      withdrawal: transactions.filter((t) => t.type === 'withdrawal').length,
      loan: transactions.filter((t) => t.type === 'loan').length,
      repayment: transactions.filter((t) => t.type === 'repayment').length,
      fd: transactions.filter((t) => t.type === 'fd').length,
      withdrawal_fd: transactions.filter((t) => t.type === 'withdrawal_fd')
        .length,
      interest_deposit: transactions.filter(
        (t) => t.type === 'interest_deposit'
      ).length,
      interest_fd: transactions.filter((t) => t.type === 'interest_fd').length,
      interest_loan: transactions.filter((t) => t.type === 'interest_loan')
        .length,
    };

    const transactionsByTypeAmount = {
      deposit: transactions
        .filter((t) => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0),
      withdrawal: transactions
        .filter((t) => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0),
      loan: transactions
        .filter((t) => t.type === 'loan')
        .reduce((sum, t) => sum + t.amount, 0),
      repayment: transactions
        .filter((t) => t.type === 'repayment')
        .reduce((sum, t) => sum + t.amount, 0),
      fd: transactions
        .filter((t) => t.type === 'fd')
        .reduce((sum, t) => sum + t.amount, 0),
      withdrawal_fd: transactions
        .filter((t) => t.type === 'withdrawal_fd')
        .reduce((sum, t) => sum + t.amount, 0),
      interest_deposit: transactions
        .filter((t) => t.type === 'interest_deposit')
        .reduce((sum, t) => sum + t.amount, 0),
      interest_fd: transactions
        .filter((t) => t.type === 'interest_fd')
        .reduce((sum, t) => sum + t.amount, 0),
      interest_loan: transactions
        .filter((t) => t.type === 'interest_loan')
        .reduce((sum, t) => sum + t.amount, 0),
    };

    // Scheme-wise user distribution
    const schemeWiseDistribution = schemes.map((scheme) => {
      const count = users.filter((u) => {
        if (scheme.name === 'deposit') return u.savingsBalance > 0;
        if (scheme.name === 'fd') return u.fd > 0;
        if (scheme.name === 'loan') return u.loanBalance > 0;
        return false;
      }).length;
      return { scheme: scheme.name, count };
    });

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

    // User balance distribution
    const balanceRanges = {
      '0-10k': users.filter(
        (u) => u.savingsBalance >= 0 && u.savingsBalance < 10000
      ).length,
      '10k-50k': users.filter(
        (u) => u.savingsBalance >= 10000 && u.savingsBalance < 50000
      ).length,
      '50k-100k': users.filter(
        (u) => u.savingsBalance >= 50000 && u.savingsBalance < 100000
      ).length,
      '100k+': users.filter((u) => u.savingsBalance >= 100000).length,
    };

    return Response.json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalAdmins,
          totalNormalUsers,
          totalSavingsBalance,
          totalFdBalance,
          totalLoanBalance,
          totalAccruedSavingInterest,
          totalAccruedFdInterest,
          totalAccruedLoanInterest,
        },
        transactionsByType,
        transactionsByTypeAmount,
        schemeWiseDistribution,
        monthlyTrends,
        balanceRanges,
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
