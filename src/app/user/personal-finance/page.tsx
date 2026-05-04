'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/hooks/useServices';
import { BarChart3, Loader } from 'lucide-react';
import NetWorthSummaryCard from '@/components/user/finance/NetWorthSummaryCard';
import AssetManager from '@/components/user/finance/AssetManager';
import LiabilityManager from '@/components/user/finance/LiabilityManager';
import CashFlowManager from '@/components/user/finance/CashFlowManager';
import BudgetDashboard from '@/components/user/finance/BudgetDashboard';
import AssetForm from '@/components/user/finance/AssetForm';
import LiabilityForm from '@/components/user/finance/LiabilityForm';
import CashFlowForm from '@/components/user/finance/CashFlowForm';
import {
  useUserFinance,
  Asset,
  Liability,
  CashFlow,
} from '@/hooks/useUserFinance';
import { getUserFeatures } from '@/lib/userFeatures';

export default function UserFinanceFeaturePage() {
  const [userId, setUserId] = useState<string>('');
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'assets' | 'liabilities' | 'cashflow' | 'budgets'
  >('assets');
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showLiabilityForm, setShowLiabilityForm] = useState(false);
  const [showCashFlowForm, setShowCashFlowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>();
  const [editingLiability, setEditingLiability] = useState<
    Liability | undefined
  >();
  const [editingCashFlow, setEditingCashFlow] = useState<
    CashFlow | undefined
  >();
  const { user, fetchUser } = useUser(userId);
  const [financeFeatureEnabled, setFinanceFeatureEnabled] =
    useState<boolean>(false);
  const {
    assets,
    liabilities,
    cashFlows,
    budgets,
    budgetSummary,
    budgetExpenseByCategory,
    netWorth,
    loading: financeLoading,
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
  } = useUserFinance();

  useEffect(() => {
    async function initializeUser() {
      try {
        const res = await fetch('/api/auth/session');
        const session = await res.json();
        if (session?.user?.id) {
          setUserId(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setPageLoading(false);
      }
    }
    initializeUser();
  }, []);

  useEffect(() => {
    setFinanceFeatureEnabled(getUserFeatures(user).financeFeaturesEnabled);
  }, [user]);

  useEffect(() => {
    if (!userId) return;
    fetchUser();
  }, [fetchUser, userId]);

  useEffect(() => {
    async function fetchFinanceData() {
      if (financeFeatureEnabled) {
        await fetchNetWorth();
        await fetchAssets();
        await fetchLiabilities();
        await fetchCashFlows();
        await fetchBudgets();
      }
    }
    fetchFinanceData();
  }, [
    financeFeatureEnabled,
    fetchNetWorth,
    fetchAssets,
    fetchLiabilities,
    fetchCashFlows,
    fetchBudgets,
  ]);

  const handleAddAsset = async (data: Omit<Asset, '_id'>) => {
    if (editingAsset) {
      await updateAsset(editingAsset._id, data);
      setEditingAsset(undefined);
    } else {
      await addAsset(data);
    }
    setShowAssetForm(false);
  };

  const handleAddLiability = async (data: Omit<Liability, '_id'>) => {
    if (editingLiability) {
      await updateLiability(editingLiability._id, data);
      setEditingLiability(undefined);
    } else {
      await addLiability(data);
    }
    setShowLiabilityForm(false);
  };

  const handleAddCashFlow = async (
    data: Omit<CashFlow, '_id'>
  ): Promise<boolean> => {
    if (editingCashFlow) {
      const updated = await updateCashFlow(editingCashFlow._id, data);
      if (updated?.budgetStatus?.hasBudget && updated.budgetStatus.isOverflow) {
        alert(
          `Budget overflow: ${updated.budgetStatus.category} exceeded by ${Math.abs(updated.budgetStatus.remaining).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
          })}`
        );
      }
      setEditingCashFlow(undefined);
      if (updated) setShowCashFlowForm(false);
      return false;
    }
    const created = await addCashFlow(data);
    if (created?.budgetStatus?.hasBudget && created.budgetStatus.isOverflow) {
      alert(
        `Budget overflow: ${created.budgetStatus.category} exceeded by ${Math.abs(created.budgetStatus.remaining).toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        })}`
      );
    }
    return !!created;
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowAssetForm(true);
  };

  const handleEditLiability = (liability: Liability) => {
    setEditingLiability(liability);
    setShowLiabilityForm(true);
  };

  const handleEditCashFlow = (cashflow: CashFlow) => {
    setEditingCashFlow(cashflow);
    setShowCashFlowForm(true);
  };

  const handleRepayLiability = async (liabilityId: string) => {
    const amount = parseFloat(
      prompt('Enter part-payment amount (₹) for liability:', '0') || '0'
    );
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    setPageLoading(true);
    try {
      const res = await fetch('/api/user/finance/update-liability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liabilityId, paymentAmount: amount }),
      });
      const result = await res.json();
      if (result.success) {
        await fetchLiabilities();
        await fetchNetWorth();
      } else {
        alert(result.error || 'Could not process repayment');
      }
    } catch (err) {
      console.error(err);
      alert('Payment failed.');
    } finally {
      setPageLoading(false);
    }
  };

  const handleCloseLiability = async (liabilityId: string) => {
    if (!confirm('Mark this liability as fully paid off?')) {
      return;
    }

    setPageLoading(true);
    try {
      const res = await fetch('/api/user/finance/update-liability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liabilityId, close: true }),
      });
      const result = await res.json();
      if (result.success) {
        await fetchLiabilities();
        await fetchNetWorth();
      } else {
        alert(result.error || 'Could not close liability');
      }
    } catch (err) {
      console.error(err);
      alert('Close liability failed.');
    } finally {
      setPageLoading(false);
    }
  };

  const handleCloseAssetForm = () => {
    setShowAssetForm(false);
    setEditingAsset(undefined);
  };

  const handleCloseLiabilityForm = () => {
    setShowLiabilityForm(false);
    setEditingLiability(undefined);
  };

  const handleCloseCashFlowForm = () => {
    setShowCashFlowForm(false);
    setEditingCashFlow(undefined);
  };

  if (pageLoading || !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">User not found</p>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Finance Feature Toggle */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Personal Finance
              </h1>
              <p className="text-gray-200">
                Manage your net worth, assets, liabilities, and cashflow.
              </p>
            </div>
            {financeFeatureEnabled && (
              <Link
                href="/user/personal-finance/income-expense-report"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors duration-200"
              >
                <BarChart3 className="w-4 h-4" />
                Income/Expense Report
              </Link>
            )}
          </div>
        </div>
        {financeFeatureEnabled ? (
          <>
            {/* Net Worth Section */}
            <div className="mt-8 mb-8">
              <NetWorthSummaryCard data={netWorth} loading={financeLoading} />
            </div>
            {/* Finance Management Section */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 backdrop-blur-sm rounded-lg overflow-hidden shadow-2xl">
              {/* Tabs */}
              <div className="flex border-b border-slate-600">
                <button
                  onClick={() => setActiveTab('assets')}
                  className={`px-6 py-4 font-medium text-sm transition-colors ${
                    activeTab === 'assets'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Assets
                </button>
                <button
                  onClick={() => setActiveTab('liabilities')}
                  className={`px-6 py-4 font-medium text-sm transition-colors ${
                    activeTab === 'liabilities'
                      ? 'text-red-400 border-b-2 border-red-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Liabilities
                </button>
                <button
                  onClick={() => setActiveTab('cashflow')}
                  className={`px-6 py-4 font-medium text-sm transition-colors ${
                    activeTab === 'cashflow'
                      ? 'text-green-400 border-b-2 border-green-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Income & Expenses
                </button>
                <button
                  onClick={() => setActiveTab('budgets')}
                  className={`px-6 py-4 font-medium text-sm transition-colors ${
                    activeTab === 'budgets'
                      ? 'text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Budgets
                </button>
              </div>
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'assets' && (
                  <AssetManager
                    assets={assets}
                    loading={financeLoading}
                    onEdit={handleEditAsset}
                    onDelete={deleteAsset}
                    onAddClick={() => setShowAssetForm(true)}
                  />
                )}
                {activeTab === 'liabilities' && (
                  <LiabilityManager
                    liabilities={liabilities}
                    loading={financeLoading}
                    onEdit={handleEditLiability}
                    onDelete={deleteLiability}
                    onRepay={handleRepayLiability}
                    onClose={handleCloseLiability}
                    onAddClick={() => setShowLiabilityForm(true)}
                  />
                )}
                {activeTab === 'cashflow' && (
                  <CashFlowManager
                    cashflows={cashFlows}
                    loading={financeLoading}
                    onEdit={handleEditCashFlow}
                    onDelete={deleteCashFlow}
                    onAddClick={() => setShowCashFlowForm(true)}
                  />
                )}
                {activeTab === 'budgets' && (
                  <BudgetDashboard
                    budgets={budgets}
                    cashFlows={cashFlows}
                    summary={budgetSummary}
                    expenseByCategory={budgetExpenseByCategory}
                    loading={financeLoading}
                    onRefresh={fetchBudgets}
                    onAddBudget={addBudget}
                    onUpdateBudget={updateBudget}
                    onDeleteBudget={deleteBudget}
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-6 mt-8 text-gray-300">
            Personal finance features are currently disabled. Enable them in
            Settings to use net worth, assets, liabilities, and cashflow
            management.
          </div>
        )}
        {/* Modals */}
        {showAssetForm && (
          <AssetForm
            asset={editingAsset}
            onSubmit={handleAddAsset}
            onCancel={handleCloseAssetForm}
            loading={financeLoading}
          />
        )}
        {showLiabilityForm && (
          <LiabilityForm
            liability={editingLiability}
            onSubmit={handleAddLiability}
            onCancel={handleCloseLiabilityForm}
            loading={financeLoading}
          />
        )}
        {showCashFlowForm && (
          <CashFlowForm
            key={editingCashFlow?._id ?? 'new-cashflow'}
            cashflow={editingCashFlow}
            liabilities={liabilities}
            onSubmit={handleAddCashFlow}
            onCancel={handleCloseCashFlowForm}
            loading={financeLoading}
          />
        )}
      </div>
    </main>
  );
}
