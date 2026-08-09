'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAdminSchemes } from '@/hooks/useAdminSchemes';
import { useAdminInterestRates } from '@/hooks/useAdminInterestRates';
import { useAdminFdWithdraw } from '@/hooks/useAdminFdWithdraw';
import { DashboardHeader } from '@/components/admin/DashboardHeader';
import { AdminStats } from '@/components/admin/sections/AdminStats';
import { UsersSection } from '@/components/admin/sections/UsersSection';
import { SchemesSection } from '@/components/admin/sections/SchemesSection';
import { MessageDisplay } from '@/components/admin/MessageDisplay';
import { Scheme, User } from '@/lib/services/adminService';

type InterestRateUpdate = {
  saving?: number | null;
  fd?: number | null;
  rd?: number | null;
  loan?: number | null;
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState('');
  const [recalculateAccruedLoading, setRecalculateAccruedLoading] =
    useState(false);
  const [assetRevaluationLoading, setAssetRevaluationLoading] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [schemeDialogOpen, setSchemeDialogOpen] = useState(false);
  const [fdWithdrawDialogOpen, setFdWithdrawDialogOpen] = useState(false);
  const [selectedUserForFd, setSelectedUserForFd] = useState<User | null>(null);
  const [interestRateDialogOpen, setInterestRateDialogOpen] = useState(false);
  const [selectedUserForInterest, setSelectedUserForInterest] =
    useState<User | null>(null);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);

  // Custom hooks encapsulating business logic
  const {
    users,
    loading,
    addUserLoading,
    resetPasswordLoading,
    resetMPINLoading,
    updateUserLoading,
    updateManagedUsersLoading,
    addUser,
    resetPassword,
    resetMPIN,
    updateUserDetails,
    updateManagedUsers,
    refetchUsers,
  } = useAdminUsers();

  const {
    schemes,
    addSchemeLoading,
    editSchemeLoading,
    deleteSchemeLoading,
    addScheme,
    editScheme,
    deleteScheme,
  } = useAdminSchemes();

  const { interestRateLoading, updateInterestRates } = useAdminInterestRates();

  const { fdWithdrawLoading, fdWithdrawInfo, fetchFdInfo, withdrawFd } =
    useAdminFdWithdraw();

  // Handle add user submission
  const handleAddUserSubmit = async (
    name: string,
    dob: string,
    password: string,
    role: 'admin' | 'privileged' | 'user',
    managedUserIds: string[]
  ) => {
    const result = await addUser(name, dob, password, role, managedUserIds);
    setMessage(result.message);
    setTimeout(() => {
      if (result.success) setUserDialogOpen(false);
      setMessage('');
    }, 2000);
    return result;
  };

  const handleUpdateManagedUsers = async (
    privilegedUserId: string,
    managedUserIds: string[]
  ) => {
    const result = await updateManagedUsers(privilegedUserId, managedUserIds);
    setMessage(result.message);
    if (result.success) {
      setTimeout(() => {
        refetchUsers();
        setMessage('');
      }, 1200);
    } else {
      setTimeout(() => setMessage(''), 2000);
    }
    return result;
  };

  const handleUpdateUser = async (
    userId: string,
    updates: {
      name: string;
      dob: string | null;
      role: 'admin' | 'privileged' | 'user';
      managedUserIds: string[];
      savingsBalance: number;
      fd: number;
      rd: number;
      loanBalance: number;
      accruedSavingInterest: number;
      accruedFdInterest: number;
      accruedRdInterest: number;
      accruedLoanInterest: number;
    }
  ) => {
    const result = await updateUserDetails(userId, updates);
    setMessage(result.message);
    if (result.success) {
      setTimeout(() => {
        refetchUsers();
        setMessage('');
      }, 1500);
    } else {
      setTimeout(() => setMessage(''), 2000);
    }
    return result;
  };

  // Handle reset password
  const handleResetPassword = async (userId: string, userName: string) => {
    if (!confirm(`Reset password for ${userName} to default (123)?`)) {
      return { success: false, message: 'Cancelled' };
    }
    const result = await resetPassword(userId, userName);
    setMessage(result.message);
    setTimeout(() => setMessage(''), 2000);
    return result;
  };

  // Handle reset MPIN
  const handleResetMPIN = async (userId: string, userName: string) => {
    if (!confirm(`Reset MPIN for ${userName} to default (0000)?`)) {
      return { success: false, message: 'Cancelled' };
    }
    const result = await resetMPIN(userId, userName);
    setMessage(result.message);
    setTimeout(() => setMessage(''), 2000);
    return result;
  };

  // Handle FD withdrawal dialog open
  const handleFdWithdrawDialogOpen = (open: boolean, user?: User) => {
    setFdWithdrawDialogOpen(open);
    if (open && user) {
      setSelectedUserForFd(user);
      fetchFdInfo(user._id);
    } else {
      setSelectedUserForFd(null);
    }
  };

  // Handle FD withdrawal submission
  const handleFdWithdrawSubmit = async (amount: number) => {
    if (!selectedUserForFd)
      return { success: false, message: 'No user selected' };
    const result = await withdrawFd(selectedUserForFd._id, amount);
    setMessage(result.message);
    if (result.success) {
      setTimeout(() => {
        refetchUsers();
        setFdWithdrawDialogOpen(false);
        setMessage('');
      }, 1500);
    } else {
      setTimeout(() => setMessage(''), 2000);
    }
    return result;
  };

  // Handle interest rate dialog open
  const handleInterestRateDialogOpen = (open: boolean, user?: User) => {
    setInterestRateDialogOpen(open);
    if (open && user) {
      setSelectedUserForInterest(user);
    } else {
      setSelectedUserForInterest(null);
    }
  };

  // Handle interest rate update
  const handleUpdateInterestRates = async (rates: InterestRateUpdate) => {
    if (!selectedUserForInterest)
      return { success: false, message: 'No user selected' };
    const result = await updateInterestRates(
      selectedUserForInterest._id,
      selectedUserForInterest.name,
      rates
    );
    setMessage(result.message);
    if (result.success) {
      setTimeout(() => {
        refetchUsers();
        setInterestRateDialogOpen(false);
        setMessage('');
      }, 1500);
    } else {
      setTimeout(() => setMessage(''), 2000);
    }
    return result;
  };

  // Handle scheme operations
  const handleAddScheme = async (
    name: string,
    interestRate: number,
    amount?: number | null,
    tenureMonths?: number | null
  ) => {
    const result = await addScheme(name, interestRate, amount, tenureMonths);
    setMessage(result.message);
    return result;
  };

  const handleEditScheme = async (
    schemeId: string,
    name: string,
    interestRate: number,
    amount?: number | null,
    tenureMonths?: number | null
  ) => {
    const result = await editScheme(
      schemeId,
      name,
      interestRate,
      amount,
      tenureMonths
    );
    setMessage(result.message);
    return result;
  };

  const handleDeleteScheme = async (schemeId: string) => {
    const result = await deleteScheme(schemeId);
    setMessage(result.message);
    setTimeout(() => setMessage(''), 2000);
    return result;
  };

  const handleRecalculateMonthAccrued = async () => {
    if (
      !confirm(
        'Replace all users’ accrued saving, FD, and loan interest with month-to-date amounts? This uses today’s balances and rates: one day’s interest × the day-of-month (e.g. on the 2nd, ×2). Existing accrued values are overwritten.'
      )
    ) {
      return;
    }
    setRecalculateAccruedLoading(true);
    try {
      const res = await fetch('/api/admin/recalculate-accrued-interest', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message ?? 'Accrued interest updated.');
      } else {
        setMessage(data.error ?? 'Recalculation failed.');
      }
      setTimeout(() => setMessage(''), 4000);
    } catch {
      setMessage('Recalculation failed.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setRecalculateAccruedLoading(false);
    }
  };

  const handleClickRecalculateBalances = async (userId: string) => {
    if (
      !confirm(
        'Recalculate balances for all users? This will update all user balances based on their transaction history.'
      )
    ) {
      return;
    }
    setAssetRevaluationLoading(true);
    try {
      const res = await fetch(`/api/admin/recalculate-balance/${userId}`, {
        method: 'GET',
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message ?? 'Recalculated Balance.');
      } else {
        setMessage(data.error ?? 'Balance recalculation failed.');
      }
      setTimeout(() => setMessage(''), 4000);
    } catch {
      setMessage('Balance recalculation failed.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setAssetRevaluationLoading(false);
    }
  };

  const handleRunAssetRevaluation = async () => {
    setAssetRevaluationLoading(true);
    try {
      const res = await fetch('/api/run-asset-revaluation');
      const data = await res.json();

      if (res.ok) {
        const result = data?.result;
        const updated = result?.assetsUpdated ?? 0;
        const scanned = result?.assetsScanned ?? 0;
        setMessage(
          `Asset revaluation completed. Updated ${updated}/${scanned}.`
        );
      } else {
        setMessage(data?.error ?? 'Asset revaluation failed.');
      }
      setTimeout(() => setMessage(''), 4000);
    } catch {
      setMessage('Asset revaluation failed.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setAssetRevaluationLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">Loading dashboard...</p>
      </div>
    );
  }

  if (
    !session?.user?.role ||
    (session.user.role !== 'admin' && session.user.role !== 'privileged')
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-red-400">Access denied.</p>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <DashboardHeader
          message={message}
          currentUserRole={session.user.role}
          onRecalculateMonthAccrued={handleRecalculateMonthAccrued}
          recalculateMonthAccruedLoading={recalculateAccruedLoading}
          onRunAssetRevaluation={handleRunAssetRevaluation}
          assetRevaluationLoading={assetRevaluationLoading}
        />

        {/* Stats Cards */}
        <AdminStats totalUsers={users.length} totalSchemes={schemes.length} />

        {/* Users Section */}
        <UsersSection
          currentUserRole={session.user.role}
          users={users}
          userDialogOpen={userDialogOpen}
          onUserDialogOpenChange={setUserDialogOpen}
          onAddUser={handleAddUserSubmit}
          addUserLoading={addUserLoading}
          onResetPassword={handleResetPassword}
          resetPasswordLoading={resetPasswordLoading}
          onResetMPIN={handleResetMPIN}
          resetMPINLoading={resetMPINLoading}
          onUpdateUser={handleUpdateUser}
          updateUserLoading={updateUserLoading}
          fdWithdrawInfo={fdWithdrawInfo}
          selectedUserForFd={selectedUserForFd}
          onFdWithdrawDialogOpen={handleFdWithdrawDialogOpen}
          fdWithdrawDialogOpen={fdWithdrawDialogOpen}
          onFdWithdrawInfoFetch={fetchFdInfo}
          onFdWithdraw={handleFdWithdrawSubmit}
          fdWithdrawLoading={fdWithdrawLoading}
          interestRateDialogOpen={interestRateDialogOpen}
          selectedUserForInterest={selectedUserForInterest}
          onInterestRateDialogOpen={handleInterestRateDialogOpen}
          onUpdateInterestRates={handleUpdateInterestRates}
          interestRateLoading={interestRateLoading}
          onUpdateManagedUsers={handleUpdateManagedUsers}
          updateManagedUsersLoading={updateManagedUsersLoading}
          onUserAdded={refetchUsers}
          clickRecalculateBalances={handleClickRecalculateBalances}
        />

        {/* Schemes Section */}
        <SchemesSection
          schemes={schemes}
          schemeDialogOpen={schemeDialogOpen}
          onSchemeDialogOpenChange={setSchemeDialogOpen}
          editingScheme={editingScheme}
          onEditingSchemeChange={setEditingScheme}
          onAddScheme={handleAddScheme}
          onEditScheme={handleEditScheme}
          addSchemeLoading={addSchemeLoading}
          editSchemeLoading={editSchemeLoading}
          onDeleteScheme={handleDeleteScheme}
          deleteSchemeLoading={deleteSchemeLoading}
        />

        {/* Message Display */}
        {message && (
          <div className="mt-6">
            <MessageDisplay message={message} />
          </div>
        )}
      </div>
    </main>
  );
}
