import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Transaction } from '@/models/Transaction';
import { Scheme } from '@/models/Scheme';

export async function GET() {
  try {
    await dbConnect();

    const [users, transactions, schemes] = await Promise.all([
      User.find({})
        .select(
          'role savingsBalance fd rd loanBalance accruedSavingInterest accruedFdInterest accruedRdInterest accruedLoanInterest'
        )
        .lean(),
      Transaction.find({}).select('type amount date').lean(),
      Scheme.find({}).select('name').lean(),
    ]);

    const totalUsers = users.length;
    let totalAdmins = 0;
    let totalSavingsBalance = 0;
    let totalFdBalance = 0;
    let totalRdBalance = 0;
    let totalLoanBalance = 0;
    let totalAccruedSavingInterest = 0;
    let totalAccruedFdInterest = 0;
    let totalAccruedRdInterest = 0;
    let totalAccruedLoanInterest = 0;

    for (const user of users) {
      if (user.role === 'admin') totalAdmins++;
      totalSavingsBalance += user.savingsBalance || 0;
      totalFdBalance += user.fd || 0;
      totalRdBalance += user.rd || 0;
      totalLoanBalance += user.loanBalance || 0;
      totalAccruedSavingInterest += user.accruedSavingInterest || 0;
      totalAccruedFdInterest += user.accruedFdInterest || 0;
      totalAccruedRdInterest += user.accruedRdInterest || 0;
      totalAccruedLoanInterest += user.accruedLoanInterest || 0;
    }

    const totalNormalUsers = totalUsers - totalAdmins;

    const transactionsByType = {
      deposit: 0,
      withdrawal: 0,
      loan: 0,
      repayment: 0,
      fd: 0,
      rd: 0,
      withdrawal_fd: 0,
      interest_deposit: 0,
      interest_fd: 0,
      interest_rd: 0,
      interest_loan: 0,
    };

    const transactionsByTypeAmount = {
      deposit: 0,
      withdrawal: 0,
      loan: 0,
      repayment: 0,
      fd: 0,
      rd: 0,
      withdrawal_fd: 0,
      interest_deposit: 0,
      interest_fd: 0,
      interest_rd: 0,
      interest_loan: 0,
    };

    // Scheme-wise user distribution
    const schemeWiseDistribution = schemes.map((scheme) => {
      const count = users.filter((u) => {
        if (scheme.name === 'deposit') return u.savingsBalance > 0;
        if (scheme.name === 'fd') return u.fd > 0;
        if (scheme.name === 'rd') return (u.rd || 0) > 0;
        if (scheme.name === 'loan') return u.loanBalance > 0;
        return false;
      }).length;
      return { scheme: scheme.name, count };
    });

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
      if (transaction.type in transactionsByType) {
        transactionsByType[
          transaction.type as keyof typeof transactionsByType
        ]++;
      }
      if (transaction.type in transactionsByTypeAmount) {
        transactionsByTypeAmount[
          transaction.type as keyof typeof transactionsByTypeAmount
        ] += amount;
      }
    }

    const balanceRanges = {
      '0-10k': users.filter(
        (u) =>
          u.savingsBalance + u.fd + (u.rd || 0) >= 0 &&
          u.savingsBalance + u.fd + (u.rd || 0) < 10000
      ).length,
      '10k-50k': users.filter(
        (u) =>
          u.savingsBalance + u.fd + (u.rd || 0) >= 10000 &&
          u.savingsBalance + u.fd + (u.rd || 0) < 50000
      ).length,
      '50k-100k': users.filter(
        (u) =>
          u.savingsBalance + u.fd + (u.rd || 0) >= 50000 &&
          u.savingsBalance + u.fd + (u.rd || 0) < 100000
      ).length,
      '100k+': users.filter(
        (u) => u.savingsBalance + u.fd + (u.rd || 0) >= 100000
      ).length,
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
          totalRdBalance,
          totalLoanBalance,
          totalAccruedSavingInterest,
          totalAccruedFdInterest,
          totalAccruedRdInterest,
          totalAccruedLoanInterest,
        },
        transactionsByType,
        transactionsByTypeAmount,
        transactions,
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
