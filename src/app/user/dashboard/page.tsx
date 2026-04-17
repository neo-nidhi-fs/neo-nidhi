'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { DashboardStats } from '@/components/user/DashboardStats';
import { ActiveChallengesSection } from '@/components/user/ActiveChallengesSection';
import { ChangePasswordDialog } from '@/components/user/ChangePasswordDialog';
import SetMPINDialog from '@/components/SetMPINDialog';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { useUser, useChallenges } from '@/hooks/useServices';
import { useUserFinance } from '@/hooks/useUserFinance';
import { getUserFeatures } from '@/lib/userFeatures';

export default function UserDashboard() {
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [pageLoading, setPageLoading] = useState(true);

  const { user, fetchUser } = useUser(userId);

  const {
    activeChallenges,
    fetchActiveChallenges,
    loading: challengeLoading,
  } = useChallenges(userId);

  const { fetchAssets, fetchLiabilities, fetchCashFlows, fetchNetWorth } =
    useUserFinance();

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

      const financeEnabled = getUserFeatures(currentUser).financeFeaturesEnabled;

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
    </main>
  );
}
