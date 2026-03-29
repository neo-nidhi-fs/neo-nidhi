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
import AssetForm from '@/components/user/finance/AssetForm';
import LiabilityForm from '@/components/user/finance/LiabilityForm';
import CashFlowForm from '@/components/user/finance/CashFlowForm';

export default function UserDashboard() {
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [pageLoading, setPageLoading] = useState(true);

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
  const [financeFeatureEnabled, setFinanceFeatureEnabled] =
    useState<boolean>(false);

  const {
    activeChallenges,
    fetchActiveChallenges,
    loading: challengeLoading,
  } = useChallenges(userId);

  const {
    loading: financeLoading,
    fetchAssets,
    fetchLiabilities,
    fetchCashFlows,
    fetchNetWorth,
    addAsset,
    updateAsset,
    addLiability,
    updateLiability,
    addCashFlow,
    updateCashFlow,
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
      const currentUser = await fetchUser();
      await fetchActiveChallenges();

      const financeEnabled =
        currentUser?.financeFeaturesEnabled ?? financeFeatureEnabled;

      if (financeEnabled) {
        await fetchNetWorth();
        await fetchAssets();
        await fetchLiabilities();
        await fetchCashFlows();
      }
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
    financeFeatureEnabled,
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

  useEffect(() => {
    if (user?.financeFeaturesEnabled !== undefined) {
      setFinanceFeatureEnabled(user.financeFeaturesEnabled);
    }
  }, [user]);

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

        {/* Finance Feature Toggle Section */}
        <div className="mb-8">
          <a
            href="/user/finance-feature"
            className={`inline-block px-6 py-3 rounded bg-blue-700 text-white font-semibold shadow hover:bg-blue-800 transition-colors ${!financeFeatureEnabled ? 'opacity-50 pointer-events-none' : ''}`}
            aria-disabled={!financeFeatureEnabled}
          >
            Go to Personal Finance
          </a>
          {!financeFeatureEnabled && (
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-6 mt-8 text-gray-300">
              Personal finance features are currently disabled. Enable them in
              Settings to use net worth, assets, liabilities, and cashflow
              management.
            </div>
          )}
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
