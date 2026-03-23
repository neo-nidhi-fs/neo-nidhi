'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRecentRecipients } from '@/hooks/useRecentRecipients';
import { useTransfer, useUser } from '@/hooks/useServices';
import { TRANSFER_MESSAGES, TRANSFER_CONFIG } from '@/constants/transfers';
import { OnlineTransferHeader } from '@/components/user/online-transfer/OnlineTransferHeader';
import { MessageBanner } from '@/components/user/online-transfer/MessageBanner';
import { QuickLinks } from '@/components/user/online-transfer/QuickLinks';
import { AccountSummary } from '@/components/user/online-transfer/AccountSummary';
import { RecentRecipients } from '@/components/user/online-transfer/RecentRecipients';
import { OnlineTransferDialogs } from '@/components/user/online-transfer/OnlineTransferDialogs';
import { Loader } from 'lucide-react';

export default function OnlineTransferPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const sessionLoading = status === 'loading';

  const { user, fetchUser, loading: userLoading } = useUser(userId ?? '');
  const { recipients: recentRecipients, refresh: refreshRecentRecipients } =
    useRecentRecipients(userId);

  const {
    transfer,
    transferToFD,
    withdrawFD,
    payLoan,
    loading: actionLoading,
    error: actionError,
    success: actionSuccess,
  } = useTransfer(userId ?? '');

  const [message, setMessage] = useState('');
  const [showMPINDialog, setShowMPINDialog] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showPayLoanDialog, setShowPayLoanDialog] = useState(false);
  const [showManageFDDialog, setShowManageFDDialog] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<{
    toUserName: string;
    amount: number;
  } | null>(null);
  const [initialRecipient, setInitialRecipient] = useState('');

  const loading = userLoading;

  useEffect(() => {
    if (!actionError && !actionSuccess) return;

    const timer = window.setTimeout(() => {
      if (actionError) setMessage(`❌ ${actionError}`);
      else if (actionSuccess) setMessage(`✅ ${actionSuccess}`);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [actionError, actionSuccess]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(
      () => setMessage(''),
      TRANSFER_CONFIG.RESET_DELAY
    );
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!userId) return;
    fetchUser();
  }, [fetchUser, userId]);

  useEffect(() => {
    if (!userId) return;
    refreshRecentRecipients();
  }, [refreshRecentRecipients, userId]);

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }, []);

  const handleRecentRecipientClick = useCallback((name: string) => {
    setInitialRecipient(name);
    setShowTransferForm(true);
  }, []);

  const completeTransfer = useCallback(
    async (toUserName: string, amount: number, mpin: string) => {
      if (!user) return false;
      const result = await transfer({
        fromUserId: userId ?? '',
        toUserName,
        amount,
        mpin,
      });

      if (result) {
        await fetchUser();
        refreshRecentRecipients();
        setPendingTransfer(null);
        setShowMPINDialog(false);
      }

      return result;
    },
    [fetchUser, refreshRecentRecipients, transfer, user, userId]
  );

  const handleMPINVerify = useCallback(
    async (mpin: string) => {
      if (!pendingTransfer) return false;
      return completeTransfer(
        pendingTransfer.toUserName,
        pendingTransfer.amount,
        mpin
      );
    },
    [completeTransfer, pendingTransfer]
  );

  const handleTransferFormSubmit = useCallback(
    (toUserName: string, amount: number) => {
      setPendingTransfer({ toUserName, amount });
      setShowTransferForm(false);
      setShowMPINDialog(true);
    },
    []
  );

  const handlePayLoan = useCallback(
    async (amount: number) => {
      const success = await payLoan(amount);
      if (success) {
        await fetchUser();
        setShowPayLoanDialog(false);
      }
    },
    [fetchUser, payLoan]
  );

  const handleTransferToFD = useCallback(
    async (amount: number) => {
      const success = await transferToFD(amount);
      if (success) {
        await fetchUser();
        setShowManageFDDialog(false);
      }
    },
    [fetchUser, transferToFD]
  );

  const handleWithdrawFromFD = useCallback(
    async (amount: number) => {
      const success = await withdrawFD(amount);
      if (success) {
        await fetchUser();
        setShowManageFDDialog(false);
      }
    },
    [fetchUser, withdrawFD]
  );

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">{TRANSFER_MESSAGES.NOT_LOGGED_IN}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">User data not found</p>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <OnlineTransferHeader />

        {message && <MessageBanner message={message} />}

        <QuickLinks
          onDirectTransfer={() => {
            setInitialRecipient('');
            setShowTransferForm(true);
          }}
          onManageFD={() => setShowManageFDDialog(true)}
          onPayLoan={() => setShowPayLoanDialog(true)}
        />

        <AccountSummary user={user} />

        <RecentRecipients
          recipients={recentRecipients}
          getInitials={getInitials}
          onSelect={handleRecentRecipientClick}
        />

        <OnlineTransferDialogs
          user={user}
          showMPINDialog={showMPINDialog}
          setShowMPINDialog={setShowMPINDialog}
          showTransferForm={showTransferForm}
          setShowTransferForm={setShowTransferForm}
          showPayLoanDialog={showPayLoanDialog}
          setShowPayLoanDialog={setShowPayLoanDialog}
          showManageFDDialog={showManageFDDialog}
          setShowManageFDDialog={setShowManageFDDialog}
          initialRecipient={initialRecipient}
          setInitialRecipient={setInitialRecipient}
          actionLoading={actionLoading}
          pendingTransfer={pendingTransfer}
          setPendingTransfer={setPendingTransfer}
          handleMPINVerify={handleMPINVerify}
          handleTransferFormSubmit={handleTransferFormSubmit}
          handlePayLoan={handlePayLoan}
          handleTransferToFD={handleTransferToFD}
          handleWithdrawFromFD={handleWithdrawFromFD}
          transferMaxAmount={user.savingsBalance}
        />
      </div>
    </main>
  );
}
