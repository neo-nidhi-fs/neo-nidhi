import { IUser } from '@/models/User';

export interface INetWorthSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  totalInterestEarned: number;
  totalInterestAccrued: number;
}

export interface IAssetBreakdown {
  savings: number;
  fd: number;
  portfolio: number;
  byType: { [key: string]: number };
}

export interface ILiabilityBreakdown {
  loans: number;
  portfolio: number;
  byType: { [key: string]: number };
}

export interface ICashFlowSummary {
  income: number;
  expenses: number;
  savings: number;
  monthlyBreakdown: {
    [month: string]: {
      income: number;
      expenses: number;
      savings: number;
    };
  };
}

/**
 * Calculate total assets from user data
 */
export function calculateTotalAssets(user: IUser): number {
  const legacyAssets = user.savingsBalance + user.fd;
  const portfolioAssets = (user.assetPortfolio || []).reduce(
    (sum: number, asset: any) => sum + (asset.marketValue || 0),
    0
  );
  return legacyAssets + portfolioAssets;
}

/**
 * Calculate total liabilities from user data
 */
export function calculateTotalLiabilities(user: IUser): number {
  const legacyLiabilities = user.loanBalance;
  const portfolioLiabilities = (user.liabilities || []).reduce(
    (sum: number, liability: any) => sum + (liability.amount || 0),
    0
  );
  return legacyLiabilities + portfolioLiabilities;
}

/**
 * Calculate net worth
 */
export function calculateNetWorth(
  totalAssets: number,
  totalLiabilities: number
): number {
  return totalAssets - totalLiabilities;
}

/**
 * Get asset breakdown by category and type
 */
export function getAssetBreakdown(user: IUser): IAssetBreakdown {
  return {
    savings: user.savingsBalance,
    fd: user.fd,
    portfolio: (user.assetPortfolio || []).reduce(
      (sum: number, asset: any) => sum + (asset.marketValue || 0),
      0
    ),
    byType: (user.assetPortfolio || []).reduce((acc: any, asset: any) => {
      if (!acc[asset.type]) {
        acc[asset.type] = 0;
      }
      acc[asset.type] += asset.marketValue || 0;
      return acc;
    }, {}),
  };
}

/**
 * Get liability breakdown by type
 */
export function getLiabilityBreakdown(user: IUser): ILiabilityBreakdown {
  return {
    loans: user.loanBalance,
    portfolio: (user.liabilities || []).reduce(
      (sum: number, liability: any) => sum + (liability.amount || 0),
      0
    ),
    byType: (user.liabilities || []).reduce((acc: any, liability: any) => {
      if (!acc[liability.type]) {
        acc[liability.type] = 0;
      }
      acc[liability.type] += liability.amount || 0;
      return acc;
    }, {}),
  };
}

/**
 * Calculate monthly income and expenses for current month
 */
export function calculateCurrentCashFlows(user: IUser): {
  income: number;
  expenses: number;
  savings: number;
} {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const income = (user.cashFlows || [])
    .filter((cf: any) => {
      const cfDate = new Date(cf.date);
      return (
        cf.type === 'income' &&
        cfDate.getMonth() === currentMonth &&
        cfDate.getFullYear() === currentYear
      );
    })
    .reduce((sum: number, cf: any) => sum + (cf.amount || 0), 0);

  const expenses = (user.cashFlows || [])
    .filter((cf: any) => {
      const cfDate = new Date(cf.date);
      return (
        cf.type === 'expense' &&
        cfDate.getMonth() === currentMonth &&
        cfDate.getFullYear() === currentYear
      );
    })
    .reduce((sum: number, cf: any) => sum + (cf.amount || 0), 0);

  return {
    income,
    expenses,
    savings: income - expenses,
  };
}

/**
 * Calculate cashflow summary with monthly breakdown
 */
export function calculateCashFlowSummary(user: IUser): ICashFlowSummary {
  const monthlyData: {
    [month: string]: {
      income: number;
      expenses: number;
    };
  } = {};

  user.cashFlows.forEach((cf: any) => {
    const date = new Date(cf.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expenses: 0 };
    }

    if (cf.type === 'income') {
      monthlyData[monthKey].income += cf.amount;
    } else {
      monthlyData[monthKey].expenses += cf.amount;
    }
  });

  const monthlyBreakdown: {
    [month: string]: {
      income: number;
      expenses: number;
      savings: number;
    };
  } = {};

  Object.entries(monthlyData).forEach(([month, data]) => {
    monthlyBreakdown[month] = {
      ...data,
      savings: data.income - data.expenses,
    };
  });

  const totalIncome = user.cashFlows
    .filter((cf: any) => cf.type === 'income')
    .reduce((sum: number, cf: any) => sum + (cf.amount || 0), 0);

  const totalExpenses = user.cashFlows
    .filter((cf: any) => cf.type === 'expense')
    .reduce((sum: number, cf: any) => sum + (cf.amount || 0), 0);

  return {
    income: totalIncome,
    expenses: totalExpenses,
    savings: totalIncome - totalExpenses,
    monthlyBreakdown,
  };
}

/**
 * Get complete net worth summary
 */
export function getNetWorthSummary(user: IUser): INetWorthSummary {
  const totalAssets = calculateTotalAssets(user);
  const totalLiabilities = calculateTotalLiabilities(user);
  const netWorth = calculateNetWorth(totalAssets, totalLiabilities);

  const cashFlows = calculateCurrentCashFlows(user);

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    monthlyIncome: cashFlows.income,
    monthlyExpenses: cashFlows.expenses,
    monthlySavings: cashFlows.savings,
    totalInterestEarned: user.accruedSavingInterest + user.accruedFdInterest,
    totalInterestAccrued: user.accruedLoanInterest,
  };
}

/**
 * Calculate unrealized gains/losses for equity/MF holdings
 */
export function calculateUnrealizedGains(user: IUser): {
  [assetId: string]: {
    gain: number;
    gainPercent: number;
  };
} {
  const gains: {
    [assetId: string]: {
      gain: number;
      gainPercent: number;
    };
  } = {};

  user.assetPortfolio.forEach((asset: any) => {
    if (
      (asset.type === 'equity' || asset.type === 'mutual_fund') &&
      asset.purchaseValue
    ) {
      const gain = asset.marketValue - asset.purchaseValue;
      const gainPercent = (gain / asset.purchaseValue) * 100;

      gains[asset._id.toString()] = {
        gain,
        gainPercent,
      };
    }
  });

  return gains;
}
