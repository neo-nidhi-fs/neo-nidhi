import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate total assets (legacy + new)
    const legacyAssets = user.savingsBalance + user.fd;
    const portfolioAssets = (user.assetPortfolio || []).reduce(
      (sum: number, asset) => sum + (asset.marketValue || 0),
      0
    );
    const totalAssets = legacyAssets + portfolioAssets;

    // Calculate total liabilities (legacy + new)
    const legacyLiabilities = user.loanBalance;
    const portfolioLiabilities = (user.liabilities || []).reduce(
      (sum: number, liability) => sum + (liability.amount || 0),
      0
    );
    const totalLiabilities = legacyLiabilities + portfolioLiabilities;

    // Calculate net worth
    const netWorth = totalAssets - totalLiabilities;

    // Calculate monthly income and expenses from cashFlows
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyIncome = (user.cashFlows || [])
      .filter((cf) => {
        const cfDate = new Date(cf.date);
        return (
          cf.type === 'income' &&
          cfDate.getMonth() === currentMonth &&
          cfDate.getFullYear() === currentYear
        );
      })
      .reduce((sum: number, cf) => sum + (cf.amount || 0), 0);

    const monthlyExpenses = (user.cashFlows || [])
      .filter((cf) => {
        const cfDate = new Date(cf.date);
        return (
          cf.type === 'expense' &&
          cfDate.getMonth() === currentMonth &&
          cfDate.getFullYear() === currentYear
        );
      })
      .reduce((sum: number, cf) => sum + (cf.amount || 0), 0);

    const monthlySavings = monthlyIncome - monthlyExpenses;

    // Calculate total interest accrued
    const totalInterestEarned =
      user.accruedSavingInterest + user.accruedFdInterest;
    const totalInterestAccrued = user.accruedLoanInterest;

    // Asset breakdown
    const assetBreakdown = {
      savings: user.savingsBalance,
      fd: user.fd,
      portfolio: portfolioAssets,
      byType: (user.assetPortfolio || []).reduce(
        (acc: { [key: string]: number }, asset) => {
          if (!acc[asset.type]) {
            acc[asset.type] = 0;
          }
          acc[asset.type] += asset.marketValue || 0;
          return acc;
        },
        {}
      ),
    };

    // Liability breakdown
    const liabilityBreakdown = {
      loans: user.loanBalance,
      portfolio: portfolioLiabilities,
      byType: (user.liabilities || []).reduce(
        (acc: { [key: string]: number }, liability) => {
          if (!acc[liability.type]) {
            acc[liability.type] = 0;
          }
          acc[liability.type] += liability.amount || 0;
          return acc;
        },
        {}
      ),
    };

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalAssets,
          totalLiabilities,
          netWorth,
          monthlyIncome,
          monthlyExpenses,
          monthlySavings,
          totalInterestEarned,
          totalInterestAccrued,
        },
        assetBreakdown,
        liabilityBreakdown,
        assets: user.assetPortfolio || [],
        liabilities: user.liabilities || [],
        recentCashFlows: user?.cashFlows?.slice(-10),
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
