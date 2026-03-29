'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { DashboardStats } from '@/components/user/DashboardStats';
import { ActiveChallengesSection } from '@/components/user/ActiveChallengesSection';
import { ChangePasswordDialog } from '@/components/user/ChangePasswordDialog';
import SetMPINDialog from '@/components/SetMPINDialog';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { useUser, useChallenges } from '@/hooks/useServices';
import {
  useUserFinance,
  Asset,
  Liability,
  CashFlow,
} from '@/hooks/useUserFinance';
import NetWorthSummaryCard from '@/components/user/finance/NetWorthSummaryCard';
import AssetManager from '@/components/user/finance/AssetManager';
import LiabilityManager from '@/components/user/finance/LiabilityManager';
import CashFlowManager from '@/components/user/finance/CashFlowManager';
import AssetForm from '@/components/user/finance/AssetForm';
import LiabilityForm from '@/components/user/finance/LiabilityForm';
import CashFlowForm from '@/components/user/finance/CashFlowForm';

export default function UserDashboard() {
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'assets' | 'liabilities' | 'cashflow'
  >('assets');

  // Finance form states
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
  const {
    activeChallenges,
    fetchActiveChallenges,
    loading: challengeLoading,
  } = useChallenges(userId);

  const {
    assets,
    liabilities,
    cashFlows,
    netWorth,
    loading: financeLoading,
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
  } = useUserFinance();

  async function initializeUser() {
    try {
      const res = await fetch('/api/auth/session');
      const session = await res.json();
      if (session?.user?.id) {
        setUserId(session.user.id);
        setUserName(session.user.name || '');
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setPageLoading(false);
    }
  }

  async function fetchUserData() {
    try {
      await fetchUser();
      await fetchActiveChallenges();
      await fetchNetWorth();
      await fetchAssets();
      await fetchLiabilities();
      await fetchCashFlows();
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  const fetchUserDataMemo = useCallback(fetchUserData, [
    fetchUser,
    fetchActiveChallenges,
    fetchNetWorth,
    fetchAssets,
    fetchLiabilities,
    fetchCashFlows,
  ]);

  // Initialize session on mount
  useEffect(() => {
    initializeUser();
  }, []);

  // Fetch user data when userId changes
  useEffect(() => {
    if (userId) {
      fetchUserDataMemo();
    }
  }, [userId, fetchUserDataMemo]);

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

  const handleAddCashFlow = async (data: Omit<CashFlow, '_id'>) => {
    if (editingCashFlow) {
      await updateCashFlow(editingCashFlow._id, data);
      setEditingCashFlow(undefined);
    } else {
      await addCashFlow(data);
    }
    setShowCashFlowForm(false);
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

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!user || !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">User not found</p>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-200">Welcome back, {userName}!</p>
        </div>

        {/* Existing Hero Stats */}
        <DashboardStats user={user} />

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
          </div>
        </div>

        {/* Active Challenges Section */}
        <div className="mt-8">
          <ActiveChallengesSection
            challenges={activeChallenges}
            loading={challengeLoading}
          />
        </div>

        {/* Settings Section */}
        <div className="space-y-4 my-12">
          <div className="flex gap-4 flex-wrap">
            <ChangePasswordDialog
              userId={userId}
              onPasswordChanged={fetchUser}
            />
            <SetMPINDialog
              userId={userId}
              hasMPIN={user.mpin !== null && user.mpin !== undefined}
              onMPINSet={fetchUser}
            />
            <QRCodeDisplay userId={userId} userName={userName} />
          </div>
        </div>
      </div>

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
          cashflow={editingCashFlow}
          onSubmit={handleAddCashFlow}
          onCancel={handleCloseCashFlowForm}
          loading={financeLoading}
        />
      )}
    </main>
  );
}
