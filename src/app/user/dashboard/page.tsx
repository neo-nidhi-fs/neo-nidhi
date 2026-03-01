'use client';

import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { DashboardHeader } from '@/components/user/DashboardHeader';
import { DashboardStats } from '@/components/user/DashboardStats';
import { ActiveChallengesSection } from '@/components/user/ActiveChallengesSection';
import { ChangePasswordDialog } from '@/components/user/ChangePasswordDialog';
import SetMPINDialog from '@/components/SetMPINDialog';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { useUser, useChallenges } from '@/hooks/useServices';

interface User {
  _id: string;
  name: string;
  savingsBalance?: number;
  fd?: number;
  loanBalance?: number;
  mpin?: string | null;
}

interface Challenge {
  _id: string;
  title: string;
  totalPrizePool: number;
}

export default function UserDashboard() {
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [pageLoading, setPageLoading] = useState(true);
  const { user, fetchUser, loading: userLoading } = useUser(userId);
  const { activeChallenges, fetchActiveChallenges, loading: challengeLoading } =
    useChallenges(userId);

  // Initialize session on mount
  useEffect(() => {
    initializeUser();
  }, []);

  // Fetch user data when userId changes
  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

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
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

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
      <div className="max-w-4xl mx-auto">
        <DashboardHeader userName={userName} />
        <DashboardStats user={user} />
        <ActiveChallengesSection challenges={activeChallenges} loading={challengeLoading} />

        {/* Settings Section */}
        <div className="space-y-4 mb-12">
          <div className="flex gap-4 flex-wrap">
            <ChangePasswordDialog userId={userId} onPasswordChanged={fetchUser} />
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
