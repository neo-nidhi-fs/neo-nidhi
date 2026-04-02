import { IUser, IAsset, ILiability } from '@/models/User';
import { ICashFlow } from '@/models/CashFlow';

export interface ILoanProjection {
  outstanding: number;
  monthlyEMI: number;
  remainingMonths: number;
  payoffDate: string | null;
  totalPayment: number;
  totalInterest: number;
}

export interface INetWorthSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  totalInterestEarned: number;
  totalInterestAccrued: number;
  totalOutstandingLoans: number;
  debtFreeDate: string | null;
  fireCorpus: number;
  fireCorpusInflationAdjusted: number;
  fireData: {
    monthsTracked: number;
    monthlyExpense: number;
    annualExpense: number;
    fireCorpus: number;
    fireCorpusInflationAdjusted: number;
    inflationRate: number;
    safeWithdrawalRate: number;
  };
  loanProjections: { [key: string]: ILoanProjection };
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
 * Calculate total market value for one asset entry
 */
export function calculateAssetValue(asset: IAsset): number {
  if (asset.quantity && asset.quantity > 0 && asset.marketValue >= 0) {
    // marketValue is per unit price for quantity-based assets
    return asset.marketValue * asset.quantity;
  }

  if (asset.marketValue && asset.marketValue > 0) {
    return asset.marketValue;
  }

  if (
    asset.quantity &&
    asset.quantity > 0 &&
    asset.amount &&
    asset.amount > 0
  ) {
    const unitPrice = asset.amount / asset.quantity;
    return unitPrice * asset.quantity;
  }

  return asset.amount || 0;
}

/**
 * Calculate total assets from user data
 */
export function calculateTotalAssets(user: IUser): number {
  const legacyAssets = (user.savingsBalance || 0) + (user.fd || 0);
  const portfolioAssets = (user.assetPortfolio || []).reduce(
    (sum: number, asset: IAsset) => sum + calculateAssetValue(asset),
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
    (sum: number, liability: ILiability) => sum + (liability.amount || 0),
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
    savings: user.savingsBalance || 0,
    fd: user.fd || 0,
    portfolio: (user.assetPortfolio || []).reduce(
      (sum: number, asset: IAsset) => sum + calculateAssetValue(asset),
      0
    ),
    byType: (user.assetPortfolio || []).reduce(
      (acc: Record<string, number>, asset: IAsset) => {
        const value = calculateAssetValue(asset);
        if (!acc[asset.type]) {
          acc[asset.type] = 0;
        }
        acc[asset.type] += value;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
}

/**
 * Get liability breakdown by type
 */
export function getLiabilityBreakdown(user: IUser): ILiabilityBreakdown {
  return {
    loans: user.loanBalance,
    portfolio: (user.liabilities || []).reduce(
      (sum: number, liability: ILiability) => sum + (liability.amount || 0),
      0
    ),
    byType: (user.liabilities || []).reduce(
      (acc: Record<string, number>, liability: ILiability) => {
        if (!acc[liability.type]) {
          acc[liability.type] = 0;
        }
        acc[liability.type] += liability.amount || 0;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
}

/**
 * Calculate monthly income and expenses for current month
 */
export function calculateCurrentCashFlows(cashFlows: ICashFlow[]): {
  income: number;
  expenses: number;
  savings: number;
} {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const income = (cashFlows || [])
    .filter((cf: ICashFlow) => {
      const cfDate = new Date(cf.date);
      return (
        cf.type === 'income' &&
        cfDate.getMonth() === currentMonth &&
        cfDate.getFullYear() === currentYear
      );
    })
    .reduce((sum: number, cf: ICashFlow) => sum + (cf.amount || 0), 0);

  const expenses = (cashFlows || [])
    .filter((cf: ICashFlow) => {
      const cfDate = new Date(cf.date);
      return (
        cf.type === 'expense' &&
        cfDate.getMonth() === currentMonth &&
        cfDate.getFullYear() === currentYear
      );
    })
    .reduce((sum: number, cf: ICashFlow) => sum + (cf.amount || 0), 0);

  return {
    income,
    expenses,
    savings: income - expenses,
  };
}

/**
 * Calculate cashflow summary with monthly breakdown
 */
export function calculateCashFlowSummary(
  cashFlows: ICashFlow[]
): ICashFlowSummary {
  const monthlyData: {
    [month: string]: {
      income: number;
      expenses: number;
    };
  } = {};

  (cashFlows || []).forEach((cf: ICashFlow) => {
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

  const totalIncome = (cashFlows || [])
    .filter((cf: ICashFlow) => cf.type === 'income')
    .reduce((sum: number, cf: ICashFlow) => sum + (cf.amount || 0), 0);

  const totalExpenses = (cashFlows || [])
    .filter((cf: ICashFlow) => cf.type === 'expense')
    .reduce((sum: number, cf: ICashFlow) => sum + (cf.amount || 0), 0);

  return {
    income: totalIncome,
    expenses: totalExpenses,
    savings: totalIncome - totalExpenses,
    monthlyBreakdown,
  };
}

export interface ILoanProjection {
  outstanding: number;
  monthlyEMI: number;
  remainingMonths: number;
  payoffDate: string | null;
  totalPayment: number;
  totalInterest: number;
}

export function monthsBetween(start: Date, end: Date): number {
  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  const days = end.getDate() - start.getDate();

  let totalMonths = years * 12 + months;
  if (days > 0) {
    totalMonths += 1;
  }

  return Math.max(0, totalMonths);
}

export function calculateLoanProjection(
  liability: ILiability
): ILoanProjection {
  if (!liability || liability.status !== 'active' || liability.amount <= 0) {
    return {
      outstanding: 0,
      monthlyEMI: 0,
      remainingMonths: 0,
      payoffDate: null,
      totalPayment: 0,
      totalInterest: 0,
    };
  }

  const principal = liability.amount;
  const annualRate = liability.interestRate || 0;
  const monthlyRate = annualRate / 12 / 100;
  const now = new Date();

  let remainingMonths = 0;
  let payoffDate: string | null = null;

  const startDate = liability.startDate
    ? new Date(liability.startDate)
    : liability.metadata?.startDate
      ? new Date(liability.metadata.startDate)
      : null;

  const termMonths = liability.metadata?.termMonths || 0;

  let due = liability.dueDate ? new Date(liability.dueDate) : null;

  if (!due && startDate && termMonths > 0) {
    due = new Date(startDate);
    due.setMonth(due.getMonth() + termMonths);
  }

  let totalTermMonths = 0;
  if (startDate && due) {
    totalTermMonths = monthsBetween(startDate, due);
  }
  if (!totalTermMonths && termMonths > 0) {
    totalTermMonths = termMonths;
  }

  let elapsedMonths = 0;
  if (startDate) {
    elapsedMonths = monthsBetween(startDate, now);
    if (totalTermMonths > 0) {
      elapsedMonths = Math.min(elapsedMonths, totalTermMonths);
    }
  }

  if (due) {
    remainingMonths = monthsBetween(now, due);
    if (remainingMonths > 0) {
      payoffDate = due.toISOString();
    } else {
      remainingMonths = 0;
      payoffDate = now.toISOString();
    }
  } else if (totalTermMonths > 0) {
    remainingMonths = Math.max(0, totalTermMonths - elapsedMonths);
    if (remainingMonths > 0 && startDate) {
      const future = new Date(now);
      future.setMonth(future.getMonth() + remainingMonths);
      payoffDate = future.toISOString();
    }
  }

  let monthlyEMI = 0;
  const outstanding = principal;

  const emiBaseMonths = remainingMonths > 0 ? remainingMonths : totalTermMonths;

  if (emiBaseMonths > 0) {
    if (monthlyRate > 0) {
      monthlyEMI =
        (principal * monthlyRate) /
        (1 - Math.pow(1 + monthlyRate, -emiBaseMonths));
    } else {
      monthlyEMI = principal / emiBaseMonths;
    }
  }

  const totalPayment = monthlyEMI * remainingMonths;
  const totalInterest = Math.max(0, totalPayment - principal);

  return {
    outstanding,
    monthlyEMI,
    remainingMonths,
    payoffDate,
    totalPayment,
    totalInterest,
  };
}

export function calculateDebtFreeDate(
  liabilities: ILiability[],
  monthlySavings: number
): string | null {
  const activeLiabilities = (liabilities || []).filter(
    (l) => l.status === 'active' && l.amount > 0
  );

  if (activeLiabilities.length === 0) return null;

  const mostLikelyDue = activeLiabilities
    .map((l) => (l.dueDate ? new Date(l.dueDate) : null))
    .filter((d): d is Date => !!d)
    .reduce((max, date) => (date > max ? date : max), new Date(0));

  const totalOutstanding = activeLiabilities.reduce(
    (sum: number, l) => sum + calculateLoanProjection(l).outstanding,
    0
  );

  if (totalOutstanding <= 0) return new Date().toISOString();

  if (monthlySavings > 0) {
    const monthsToPay = Math.ceil(totalOutstanding / monthlySavings);
    const estimatedDebtFree = new Date();
    estimatedDebtFree.setMonth(estimatedDebtFree.getMonth() + monthsToPay);

    if (mostLikelyDue.getTime() === 0) {
      return estimatedDebtFree.toISOString();
    }

    return estimatedDebtFree < mostLikelyDue
      ? estimatedDebtFree.toISOString()
      : mostLikelyDue.toISOString();
  }

  if (mostLikelyDue.getTime() !== 0) {
    return mostLikelyDue.toISOString();
  }

  return null;
}

export function calculateFIRECorpus(
  cashFlows: ICashFlow[],
  monthsToUse = 6,
  inflationRate = 0.07,
  safeWithdrawalRate = 0.04
) {
  const now = new Date();

  let totalExpense = 0;
  let filledMonths = 0;

  for (let m = 0; m < monthsToUse; m += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const monthExpense = (cashFlows || [])
      .filter((cf) => cf.type === 'expense')
      .filter((cf) => {
        const cfDate = new Date(cf.date);
        const key = `${cfDate.getFullYear()}-${String(cfDate.getMonth() + 1).padStart(2, '0')}`;
        return key === monthKey;
      })
      .reduce((sum, cf) => sum + cf.amount, 0);

    if (monthExpense > 0) {
      totalExpense += monthExpense;
      filledMonths += 1;
    }
  }

  const monthsForAvg = filledMonths > 0 ? filledMonths : monthsToUse;
  const avgMonthlyExpense = totalExpense / monthsForAvg;
  const annualExpense = avgMonthlyExpense * 12;
  const fireCorpus = annualExpense / safeWithdrawalRate;
  const fireCorpusInflationAdjusted =
    fireCorpus * Math.pow(1 + inflationRate, 10);

  return {
    monthsTracked: monthsForAvg,
    monthlyExpense: avgMonthlyExpense,
    annualExpense,
    fireCorpus,
    fireCorpusInflationAdjusted,
    inflationRate,
    safeWithdrawalRate,
  };
}

/**
 * Get complete net worth summary
 */
export function getNetWorthSummary(
  user: IUser,
  cashFlows: ICashFlow[]
): INetWorthSummary {
  const totalAssets = calculateTotalAssets(user);
  const totalLiabilities = calculateTotalLiabilities(user);
  const netWorth = calculateNetWorth(totalAssets, totalLiabilities);

  const cashFlowStats = calculateCurrentCashFlows(cashFlows);

  const loanProjections = (user.liabilities || []).reduce(
    (acc: Record<string, ILoanProjection>, liability: ILiability) => {
      acc[
        liability._id?.toString() ||
          liability.type ||
          `liability-${Math.random()}`
      ] = calculateLoanProjection(liability);
      return acc;
    },
    {}
  );

  const totalOutstandingLoans = Object.values(loanProjections).reduce(
    (sum, projection) => sum + projection.outstanding,
    0
  );

  const fireScore = calculateFIRECorpus(cashFlows, 6, 0.07, 0.04);
  const debtFreeDate = calculateDebtFreeDate(
    user.liabilities || [],
    cashFlowStats.savings > 0 ? cashFlowStats.savings : 0
  );

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    monthlyIncome: cashFlowStats.income,
    monthlyExpenses: cashFlowStats.expenses,
    monthlySavings: cashFlowStats.savings,
    totalInterestEarned: user.accruedSavingInterest + user.accruedFdInterest,
    totalInterestAccrued: user.accruedLoanInterest,
    totalOutstandingLoans,
    debtFreeDate,
    fireCorpus: fireScore.fireCorpus,
    fireCorpusInflationAdjusted: fireScore.fireCorpusInflationAdjusted,
    fireData: fireScore,
    loanProjections,
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

  user.assetPortfolio.forEach((asset: IAsset) => {
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
