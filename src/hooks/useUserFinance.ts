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
  metadata?: Record<string, any>;
}

export interface Liability {
  _id: string;
  type: string;
  amount: number;
  interestRate?: number;
  startDate?: string;
  dueDate?: string;
  status: 'active' | 'paid_off' | 'closed';
  metadata?: Record<string, any>;
  projection?: {
    outstanding: number;
    monthlyEMI: number;
    remainingMonths: number;
    payoffDate: string | null;
    totalPayment: number;
    totalInterest: number;
  };
}

export interface CashFlow {
  _id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  source: string;
  liabilityId?: string;
  note?: string;
}

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
    loanProjections: Record<string, any>;
  };
  assetBreakdown: any;
  liabilityBreakdown: any;
  assets: Asset[];
  liabilities: Liability[];
  recentCashFlows: CashFlow[];
}

export function useUserFinance() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
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
    [cashFlows, fetchNetWorth]
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
    [cashFlows, fetchNetWorth]
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
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [cashFlows, fetchNetWorth]
  );

  return {
    assets,
    liabilities,
    cashFlows,
    netWorth,
    loading,
    error,
    fetchAssets,
    fetchLiabilities,
    fetchCashFlows,
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
  };
}
