'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { DashboardStats } from '@/components/user/DashboardStats';
import { ActiveChallengesSection } from '@/components/user/ActiveChallengesSection';
import { ChangePasswordDialog } from '@/components/user/ChangePasswordDialog';
import SetMPINDialog from '@/components/SetMPINDialog';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { useUser, useChallenges } from '@/hooks/useServices';
import { useUserFinance } from '@/hooks/useUserFinance';
import { getUserFeatures } from '@/lib/userFeatures';
import { useAutoSmsFinanceSync } from '@/hooks/useAutoSmsFinanceSync';
import { isNativeApp } from '@/lib/native';
import { requestSmsReadPermission } from '@/lib/native/sms';

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isAdminViewingAnotherUser, setIsAdminViewingAnotherUser] =
    useState(false);
  const [financeFeatureEnabled, setFinanceFeatureEnabled] = useState(false);
  const [resolvedUser, setResolvedUser] = useState<{
    name?: string;
    savingsBalance: number;
    fd: number;
    rd?: number;
    loanBalance: number;
    accruedRdInterest?: number;
    mpin?: string | null;
    features?: Record<string, unknown>;
    financeFeaturesEnabled?: boolean;
  } | null>(null);
  const [smsPermissionStatus, setSmsPermissionStatus] = useState<
    'idle' | 'granted' | 'denied' | 'error'
  >('idle');
  const [smsPermissionError, setSmsPermissionError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  const { user, fetchUser } = useUser(userId);

  const {
    activeChallenges,
    fetchActiveChallenges,
    loading: challengeLoading,
  } = useChallenges(userId);

  const { fetchAssets, fetchLiabilities, fetchCashFlows, fetchNetWorth } =
    useUserFinance();
  useAutoSmsFinanceSync(financeFeatureEnabled);

  async function initializeUser() {
    try {
      if (!session?.user?.id) return;

      const viewUserId = new URLSearchParams(window.location.search).get(
        'viewUserId'
      );
      const isAdminLike =
        session.user.role === 'admin' || session.user.role === 'privileged';
      const targetUserId = isAdminLike && viewUserId ? viewUserId : session.user.id;

      if (!targetUserId) return;
      setUserId(targetUserId);
      setUserName(session.user.name || '');
      setIsAdminViewingAnotherUser(
        Boolean(
          isAdminLike && viewUserId && viewUserId !== session.user.id
        )
      );
      if (!viewUserId || !isAdminLike) {
        setIsAdminViewingAnotherUser(false);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setPageLoading(false);
    }
  }

  async function fetchUserData() {
    try {
      let currentUser = await fetchUser();
      if (!currentUser && isAdminViewingAnotherUser) {
        const usersRes = await fetch('/api/users');
        const usersData = await usersRes.json();
        if (usersRes.ok && Array.isArray(usersData.data)) {
          currentUser =
            usersData.data.find((u: { _id: string }) => u._id === userId) ||
            null;
        }
      }
      setResolvedUser(currentUser);
      await fetchActiveChallenges();

      if (!currentUser) return;
      const financeEnabled = getUserFeatures(currentUser).financeFeaturesEnabled;
      setFinanceFeatureEnabled(financeEnabled);

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
    isAdminViewingAnotherUser,
    userId,
    fetchActiveChallenges,
    fetchNetWorth,
    fetchAssets,
    fetchLiabilities,
    fetchCashFlows,
  ]);

  const handleRequestSmsPermission = useCallback(async () => {
    try {
      const granted = await requestSmsReadPermission();
      setSmsPermissionError('');
      setSmsPermissionStatus(granted ? 'granted' : 'denied');
    } catch (error) {
      console.error('Failed to request SMS permission:', error);
      setSmsPermissionError(error instanceof Error ? error.message : String(error));
      setSmsPermissionStatus('error');
    }
  }, [session]);

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

  if (pageLoading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const displayUser = resolvedUser || user;

  if (!displayUser || !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">
          {status === 'authenticated'
            ? 'User not found or access denied'
            : 'User not found'}
        </p>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-200">
            Welcome back,{' '}
            {isAdminViewingAnotherUser
              ? displayUser?.name || 'User'
              : userName}
            !
          </p>
          {isAdminViewingAnotherUser && (
            <p className="text-cyan-300 text-sm mt-2">
              Admin view mode: showing selected user dashboard.
            </p>
          )}
        </div>

        {/* Existing Hero Stats */}
        <DashboardStats user={displayUser} />

        {/* Active Challenges Section */}
        <div className="mt-8">
          <ActiveChallengesSection
            challenges={activeChallenges}
            loading={challengeLoading}
          />
        </div>

        {/* Settings Section */}
        {!isAdminViewingAnotherUser && (
          <div className="space-y-4 my-12">
            <div className="flex gap-4 flex-wrap">
              <ChangePasswordDialog
                userId={userId}
                onPasswordChanged={fetchUser}
              />
              <SetMPINDialog
                userId={userId}
                hasMPIN={
                  displayUser.mpin !== null && displayUser.mpin !== undefined
                }
                onMPINSet={fetchUser}
              />
              <QRCodeDisplay userId={userId} userName={userName} />
              {isNativeApp() && (
                <button
                  type="button"
                  onClick={handleRequestSmsPermission}
                  className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
                >
                  Allow SMS Access
                </button>
              )}
            </div>
            {isNativeApp() && smsPermissionStatus !== 'idle' && (
              <p className="text-sm text-gray-200">
                {smsPermissionStatus === 'granted' && 'SMS permission granted.'}
                {smsPermissionStatus === 'denied' &&
                  'SMS permission denied. Please allow SMS in Android app settings.'}
                {smsPermissionStatus === 'error' &&
                  `Could not request SMS permission. ${smsPermissionError || 'Check app logs and plugin setup.'}`}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
