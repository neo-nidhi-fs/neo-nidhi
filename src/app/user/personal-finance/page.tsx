'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/hooks/useServices';
import { BarChart3, FolderKanban, Loader } from 'lucide-react';
import NetWorthSummaryCard from '@/components/user/finance/NetWorthSummaryCard';
import { useUserFinance } from '@/hooks/useUserFinance';
import { getUserFeatures } from '@/lib/userFeatures';

export default function UserFinanceFeaturePage() {
  const [userId, setUserId] = useState<string>('');
  const [pageLoading, setPageLoading] = useState(true);
  const { user, fetchUser } = useUser(userId);
  const [financeFeatureEnabled, setFinanceFeatureEnabled] = useState<boolean>(false);
  const { netWorth, loading: financeLoading, fetchNetWorth } = useUserFinance();

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
      }
    }
    fetchFinanceData();
  }, [financeFeatureEnabled, fetchNetWorth]);

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
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Personal Finance</h1>
              <p className="text-gray-200">Manage your net worth, assets, liabilities, and cashflow.</p>
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
            <div className="mt-8 mb-8">
              <NetWorthSummaryCard data={netWorth} loading={financeLoading} />
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-6 text-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Detailed Management</h2>
                  <p className="text-sm text-gray-300 mt-1">
                    Assets, liabilities, income & expenses, and budgets are loaded on a separate
                    page for faster performance.
                  </p>
                </div>
                <Link
                  href="/user/personal-finance/manage"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
                >
                  <FolderKanban className="w-4 h-4" />
                  Open Finance Manager
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-6 mt-8 text-gray-300">
            Personal finance features are currently disabled. Enable them in Settings to use net
            worth, assets, liabilities, and cashflow management.
          </div>
        )}
      </div>
    </main>
  );
}