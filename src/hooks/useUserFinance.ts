'use client';

import { useState, useCallback } from 'react';

export interface Asset {
  _id: string;
  type:
    | 'fd'
    | 'rd'
    | 'equity'
    | 'mutual_fund'
    | 'epfo'
    | 'etf'
    | 'gold'
    | 'silver'
    | 'other';
  category: string;
  amount: number;
  quantity?: number;
  purchaseValue?: number;
  marketValue: number;
  symbolOrCode?: string;
  startDate?: string;
  maturityDate?: string;
  rateOfInterest?: number;
  investmentMode?: 'monthly' | 'quarterly' | 'yearly';
  metadata?: Record<string, number | string | Date | undefined>;
}

export interface Liability {
  _id: string;
  type: string;
  amount: number;
  interestRate?: number;
  startDate?: string;
  note?: string;
  dueDate?: string;
  status: 'active' | 'paid_off' | 'closed';
  metadata?: Record<string, number | string | Date | undefined>;
  projection?: {
    outstanding: number;
    monthlyEMI: number;
    remainingMonths: number;
    payoffDate: string | null;
    totalPayment: number;
    totalInterest: number;
  };
}

/**
 * `credit_card` is kept as a legacy value for older entries.
 * New entries should use `card`.
 */
export type ExpensePaymentSource =
  | 'account'
  | 'cash'
  | 'card'
  | 'wallet'
  | 'credit_card';

export interface CashFlow {
  _id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  source: string;
  /** Optional (expense); omitted in DB until set; UI treats missing as account */
  paymentSource?: ExpensePaymentSource;
  liabilityId?: string;
  note?: string;
}

export interface Budget {
  _id: string;
  month: string; // YYYY-MM
  category: string;
  amount: number;
  note?: string | null;
  spent: number;
  remaining: number;
  usagePercent: number;
  isOverflow: boolean;
}

export interface BudgetSummary {
  month: string;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  overflowCount: number;
}

export interface BudgetExpenseCategoryTotal {
  _id: string;
  total: number;
}

type AssetBreakdown = Record<string, number>;
type LiabilityBreakdown = Record<string, number>;

export interface NetWorthSummary {
  summary: {
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
    loanProjections: Record<
      string,
      { outstanding: number; monthlyEMI: number }
    >; // instead of using any type use proper type for loanProjections
  };
  assetBreakdown: AssetBreakdown;
  liabilityBreakdown: LiabilityBreakdown;
  assets: Asset[];
  liabilities: Liability[];
  recentCashFlows: CashFlow[];
}

export function useUserFinance() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(
    null
  );
  const [budgetExpenseByCategory, setBudgetExpenseByCategory] = useState<
    BudgetExpenseCategoryTotal[]
  >([]);
  const [netWorth, setNetWorth] = useState<NetWorthSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/finance/list-assets');
      const data = await res.json();
      if (data.success) {
        setAssets(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLiabilities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/finance/list-liabilities');
      const data = await res.json();
      if (data.success) {
        setLiabilities(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCashFlows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/finance/list-cashflows');
      const data = await res.json();
      if (data.success) {
        setCashFlows(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNetWorth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/finance/networth');
      const data = await res.json();
      if (data.success) {
        setNetWorth(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBudgets = useCallback(async (month?: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = month ? `?month=${encodeURIComponent(month)}` : '';
      const res = await fetch(`/api/user/finance/list-budgets${query}`);
      const data = await res.json();
      if (data.success) {
        setBudgets(data.data?.budgets || []);
        setBudgetSummary(data.data?.summary || null);
        setBudgetExpenseByCategory(data.data?.monthExpensesByCategory || []);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addAsset = useCallback(
    async (asset: Omit<Asset, '_id'>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/user/finance/add-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(asset),
        });
        const data = await res.json();
        if (data.success) {
          setAssets([...assets, data.data]);
          await fetchNetWorth();
          return data.data;
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [assets, fetchNetWorth]
  );

  const updateAsset = useCallback(
    async (assetId: string, asset: Partial<Asset>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/user/finance/update-asset', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId, ...asset }),
        });
        const data = await res.json();
        if (data.success) {
          setAssets(assets.map((a) => (a._id === assetId ? data.data : a)));
          await fetchNetWorth();
          return data.data;
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [assets, fetchNetWorth]
  );

  const deleteAsset = useCallback(
    async (assetId: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/user/finance/delete-asset', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId }),
        });
        const data = await res.json();
        if (data.success) {
          setAssets(assets.filter((a) => a._id !== assetId));
          await fetchNetWorth();
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [assets, fetchNetWorth]
  );

  const addLiability = useCallback(
    async (liability: Omit<Liability, '_id'>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/user/finance/add-liability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(liability),
        });
        const data = await res.json();
        if (data.success) {
          setLiabilities([...liabilities, data.data]);
          await fetchNetWorth();
          return data.data;
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [liabilities, fetchNetWorth]
  );

  const updateLiability = useCallback(
    async (liabilityId: string, liability: Partial<Liability>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/user/finance/update-liability', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ liabilityId, ...liability }),
        });
        const data = await res.json();
        if (data.success) {
          setLiabilities(
            liabilities.map((l) => (l._id === liabilityId ? data.data : l))
          );
          await fetchNetWorth();
          return data.data;
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [liabilities, fetchNetWorth]
  );

  const deleteLiability = useCallback(
    async (liabilityId: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/user/finance/delete-liability', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ liabilityId }),
        });
        const data = await res.json();
        if (data.success) {
          setLiabilities(liabilities.filter((l) => l._id !== liabilityId));
          await fetchNetWorth();
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [liabilities, fetchNetWorth]
  );

  const addCashFlow = useCallback(
    async (cashFlow: Omit<CashFlow, '_id'>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/user/finance/add-cashflow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cashFlow),
        });
        const data = await res.json();
        if (data.success) {
          setCashFlows([...cashFlows, data.data]);
          await fetchNetWorth();
          await fetchBudgets();
          return data;
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [cashFlows, fetchBudgets, fetchNetWorth]
  );

  const updateCashFlow = useCallback(
    async (cashflowId: string, cashFlow: Partial<CashFlow>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/user/finance/update-cashflow', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cashflowId, ...cashFlow }),
        });
        const data = await res.json();
        if (data.success) {
          setCashFlows(
            cashFlows.map((c) => (c._id === cashflowId ? data.data : c))
          );
          await fetchNetWorth();
          await fetchBudgets();
          return data;
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [cashFlows, fetchBudgets, fetchNetWorth]
  );

  const deleteCashFlow = useCallback(
    async (cashflowId: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/user/finance/delete-cashflow', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cashflowId }),
        });
        const data = await res.json();
        if (data.success) {
          setCashFlows(cashFlows.filter((c) => c._id !== cashflowId));
          await fetchNetWorth();
          await fetchBudgets();
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [cashFlows, fetchBudgets, fetchNetWorth]
  );

  const addBudget = useCallback(
    async (budget: Omit<Budget, '_id' | 'spent' | 'remaining' | 'usagePercent' | 'isOverflow'>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/user/finance/add-budget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(budget),
        });
        const data = await res.json();
        if (data.success) {
          await fetchBudgets();
          await fetchNetWorth();
          return data.data;
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [fetchBudgets, fetchNetWorth]
  );

  const updateBudget = useCallback(
    async (
      budgetId: string,
      budget: Partial<
        Omit<
          Budget,
          '_id' | 'spent' | 'remaining' | 'usagePercent' | 'isOverflow'
        >
      >
    ) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/user/finance/update-budget', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ budgetId, ...budget }),
        });
        const data = await res.json();
        if (data.success) {
          await fetchBudgets();
          return data.data;
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [fetchBudgets]
  );

  const deleteBudget = useCallback(
    async (budgetId: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/user/finance/delete-budget', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ budgetId }),
        });
        const data = await res.json();
        if (data.success) {
          await fetchBudgets();
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [fetchBudgets]
  );

  return {
    assets,
    liabilities,
    cashFlows,
    budgets,
    budgetSummary,
    budgetExpenseByCategory,
    netWorth,
    loading,
    error,
    fetchAssets,
    fetchLiabilities,
    fetchCashFlows,
    fetchBudgets,
    fetchNetWorth,
    addAsset,
    updateAsset,
    deleteAsset,
    addLiability,
    updateLiability,
    deleteLiability,
    addCashFlow,
    updateCashFlow,
    deleteCashFlow,
    addBudget,
    updateBudget,
    deleteBudget,
  };
}
