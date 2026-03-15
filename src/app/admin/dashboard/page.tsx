'use client';

import { useState } from 'react';
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
  loan?: number | null;
};

export default function AdminDashboard() {
  const [message, setMessage] = useState('');
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
    updateUserLoading,
    addUser,
    resetPassword,
    updateUserDob,
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
    password: string
  ) => {
    const result = await addUser(name, dob, password);
    setMessage(result.message);
    setTimeout(() => {
      if (result.success) setUserDialogOpen(false);
      setMessage('');
    }, 2000);
    return result;
  };

  // Handle updating user DOB
  const handleUpdateDob = async (userId: string, dob: string | null) => {
    const result = await updateUserDob(userId, dob);
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
  const handleAddScheme = async (name: string, interestRate: number) => {
    const result = await addScheme(name, interestRate);
    setMessage(result.message);
    return result;
  };

  const handleEditScheme = async (
    schemeId: string,
    name: string,
    interestRate: number
  ) => {
    const result = await editScheme(schemeId, name, interestRate);
    setMessage(result.message);
    return result;
  };

  const handleDeleteScheme = async (schemeId: string) => {
    const result = await deleteScheme(schemeId);
    setMessage(result.message);
    setTimeout(() => setMessage(''), 2000);
    return result;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <DashboardHeader message={message} />

        {/* Stats Cards */}
        <AdminStats totalUsers={users.length} totalSchemes={schemes.length} />

        {/* Users Section */}
        <UsersSection
          users={users}
          userDialogOpen={userDialogOpen}
          onUserDialogOpenChange={setUserDialogOpen}
          onAddUser={handleAddUserSubmit}
          addUserLoading={addUserLoading}
          onResetPassword={handleResetPassword}
          resetPasswordLoading={resetPasswordLoading}
          onUpdateDob={handleUpdateDob}
          updateDobLoading={updateUserLoading}
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
          onUserAdded={refetchUsers}
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
