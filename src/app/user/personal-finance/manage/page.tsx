'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader } from 'lucide-react';
import { useUser } from '@/hooks/useServices';
import AssetManager from '@/components/user/finance/AssetManager';
import LiabilityManager from '@/components/user/finance/LiabilityManager';
import CashFlowManager from '@/components/user/finance/CashFlowManager';
import BudgetDashboard from '@/components/user/finance/BudgetDashboard';
import AssetForm from '@/components/user/finance/AssetForm';
import LiabilityForm from '@/components/user/finance/LiabilityForm';
import CashFlowForm from '@/components/user/finance/CashFlowForm';
import { useUserFinance, Asset, Liability, CashFlow } from '@/hooks/useUserFinance';
import { getUserFeatures } from '@/lib/userFeatures';

type TabKey = 'assets' | 'liabilities' | 'cashflow' | 'budgets';

export default function PersonalFinanceManagePage() {
  const [userId, setUserId] = useState<string>('');
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('assets');
  const [loadedTabs, setLoadedTabs] = useState<Record<TabKey, boolean>>({
    assets: false,
    liabilities: false,
    cashflow: false,
    budgets: false,
  });
  const [tabLoading, setTabLoading] = useState<Record<TabKey, boolean>>({
    assets: false,
    liabilities: false,
    cashflow: false,
    budgets: false,
  });

  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showLiabilityForm, setShowLiabilityForm] = useState(false);
  const [showCashFlowForm, setShowCashFlowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>();
  const [editingLiability, setEditingLiability] = useState<Liability | undefined>();
  const [editingCashFlow, setEditingCashFlow] = useState<CashFlow | undefined>();

  const { user, fetchUser } = useUser(userId);
  const [financeFeatureEnabled, setFinanceFeatureEnabled] = useState<boolean>(false);

  const {
    assets,
    liabilities,
    cashFlows,
    budgets,
    budgetSummary,
    budgetExpenseByCategory,
    loading: financeLoading,
    fetchAssets,
    fetchLiabilities,
    fetchCashFlows,
    fetchBudgets,
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
    async function loadDefaultAssets() {
      if (!financeFeatureEnabled || loadedTabs.assets) return;
      setTabLoading((prev) => ({ ...prev, assets: true }));
      await fetchAssets();
      setLoadedTabs((prev) => ({ ...prev, assets: true }));
      setTabLoading((prev) => ({ ...prev, assets: false }));
    }
    loadDefaultAssets();
  }, [financeFeatureEnabled, fetchAssets, loadedTabs.assets]);

  useEffect(() => {
    async function loadTabOnDemand() {
      if (!financeFeatureEnabled) return;
      if (activeTab === 'assets' || loadedTabs[activeTab]) return;
      setTabLoading((prev) => ({ ...prev, [activeTab]: true }));

      if (activeTab === 'liabilities') {
        await fetchLiabilities();
      } else if (activeTab === 'cashflow') {
        await fetchCashFlows();
      } else if (activeTab === 'budgets') {
        await fetchBudgets();
      }

      setLoadedTabs((prev) => ({ ...prev, [activeTab]: true }));
      setTabLoading((prev) => ({ ...prev, [activeTab]: false }));
    }
    loadTabOnDemand();
  }, [
    activeTab,
    fetchBudgets,
    fetchCashFlows,
    fetchLiabilities,
    financeFeatureEnabled,
    loadedTabs,
  ]);

  const ensureLiabilitiesLoaded = async () => {
    if (loadedTabs.liabilities) return;
    await fetchLiabilities();
    setLoadedTabs((prev) => ({ ...prev, liabilities: true }));
  };

  const handleAddAsset = async (data: Omit<Asset, '_id'>) => {
    if (editingAsset) {
      await updateAsset(editingAsset._id, data);
      setEditingAsset(undefined);
    } else {
      await addAsset(data);
    }
    setShowAssetForm(false);
    setLoadedTabs((prev) => ({ ...prev, assets: true }));
  };

  const handleAddLiability = async (data: Omit<Liability, '_id'>) => {
    if (editingLiability) {
      await updateLiability(editingLiability._id, data);
      setEditingLiability(undefined);
    } else {
      await addLiability(data);
    }
    setShowLiabilityForm(false);
    setLoadedTabs((prev) => ({ ...prev, liabilities: true }));
  };

  const handleAddCashFlow = async (data: Omit<CashFlow, '_id'>): Promise<boolean> => {
    if (editingCashFlow) {
      const updated = await updateCashFlow(editingCashFlow._id, data);
      setEditingCashFlow(undefined);
      if (updated) setShowCashFlowForm(false);
      return false;
    }
    const created = await addCashFlow(data);
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

  const handleEditCashFlow = async (cashflow: CashFlow) => {
    await ensureLiabilitiesLoaded();
    setEditingCashFlow(cashflow);
    setShowCashFlowForm(true);
  };

  const handleRepayLiability = async (liabilityId: string) => {
    const amount = parseFloat(prompt('Enter part-payment amount (INR) for liability:', '0') || '0');
    if (isNaN(amount) || amount <= 0) return;

    const res = await fetch('/api/user/finance/update-liability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liabilityId, paymentAmount: amount }),
    });
    const result = await res.json();
    if (!result.success) {
      alert(result.error || 'Could not process repayment');
      return;
    }
    await fetchLiabilities();
  };

  const handleCloseLiability = async (liabilityId: string) => {
    if (!confirm('Mark this liability as fully paid off?')) return;

    const res = await fetch('/api/user/finance/update-liability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liabilityId, close: true }),
    });
    const result = await res.json();
    if (!result.success) {
      alert(result.error || 'Could not close liability');
      return;
    }
    await fetchLiabilities();
  };

  if (pageLoading || !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!user || !financeFeatureEnabled) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">Personal finance is not available for this account.</p>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/user/personal-finance"
            className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Personal Finance
          </Link>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 backdrop-blur-sm rounded-lg overflow-hidden shadow-2xl">
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

          <div className="p-6">
            {tabLoading.assets && activeTab === 'assets' && (
              <div className="mb-4 rounded-md border border-slate-600 bg-slate-800/70 px-3 py-2 text-sm text-slate-200">
                Loading assets...
              </div>
            )}
            {tabLoading.liabilities && activeTab === 'liabilities' && (
              <div className="mb-4 rounded-md border border-slate-600 bg-slate-800/70 px-3 py-2 text-sm text-slate-200">
                Loading liabilities...
              </div>
            )}
            {tabLoading.cashflow && activeTab === 'cashflow' && (
              <div className="mb-4 rounded-md border border-slate-600 bg-slate-800/70 px-3 py-2 text-sm text-slate-200">
                Loading income & expenses...
              </div>
            )}
            {tabLoading.budgets && activeTab === 'budgets' && (
              <div className="mb-4 rounded-md border border-slate-600 bg-slate-800/70 px-3 py-2 text-sm text-slate-200">
                Loading budgets...
              </div>
            )}

            {activeTab === 'assets' && (
              <AssetManager
                assets={assets}
                loading={tabLoading.assets || (financeLoading && !loadedTabs.assets)}
                onEdit={handleEditAsset}
                onDelete={deleteAsset}
                onAddClick={() => setShowAssetForm(true)}
              />
            )}
            {activeTab === 'liabilities' && (
              <LiabilityManager
                liabilities={liabilities}
                loading={tabLoading.liabilities || (financeLoading && !loadedTabs.liabilities)}
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
                loading={tabLoading.cashflow || (financeLoading && !loadedTabs.cashflow)}
                onEdit={(cashflow) => {
                  void handleEditCashFlow(cashflow);
                }}
                onDelete={deleteCashFlow}
                onAddClick={async () => {
                  await ensureLiabilitiesLoaded();
                  setShowCashFlowForm(true);
                }}
              />
            )}
            {activeTab === 'budgets' && (
              <BudgetDashboard
                budgets={budgets}
                cashFlows={cashFlows}
                summary={budgetSummary}
                expenseByCategory={budgetExpenseByCategory}
                loading={tabLoading.budgets || (financeLoading && !loadedTabs.budgets)}
                onRefresh={fetchBudgets}
                onAddBudget={addBudget}
                onUpdateBudget={updateBudget}
                onDeleteBudget={deleteBudget}
              />
            )}
          </div>
        </div>

        {showAssetForm && (
          <AssetForm
            asset={editingAsset}
            onSubmit={handleAddAsset}
            onCancel={() => {
              setShowAssetForm(false);
              setEditingAsset(undefined);
            }}
            loading={financeLoading}
          />
        )}
        {showLiabilityForm && (
          <LiabilityForm
            liability={editingLiability}
            onSubmit={handleAddLiability}
            onCancel={() => {
              setShowLiabilityForm(false);
              setEditingLiability(undefined);
            }}
            loading={financeLoading}
          />
        )}
        {showCashFlowForm && (
          <CashFlowForm
            key={editingCashFlow?._id ?? 'new-cashflow'}
            cashflow={editingCashFlow}
            liabilities={liabilities}
            onSubmit={handleAddCashFlow}
            onCancel={() => {
              setShowCashFlowForm(false);
              setEditingCashFlow(undefined);
            }}
            loading={financeLoading}
          />
        )}
      </div>
    </main>
  );
}
