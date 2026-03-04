'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, QrCode, Send, DollarSign, CreditCard } from 'lucide-react';
import MPINVerificationDialog from '@/components/MPINVerificationDialog';
import { MoneyTransferForm } from '@/components/transfers/MoneyTransferForm';
import { PayLoanDialog } from '@/components/transfers/PayLoanDialog';
import { ManageFDDialog } from '@/components/transfers/ManageFDDialog';
import { User } from '@/types/entities';
import {
  TRANSFER_ENDPOINTS,
  TRANSFER_MESSAGES,
  TRANSFER_CONFIG,
} from '@/constants/transfers';

export default function OnlineTransferPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [mpinLoading, setMpinLoading] = useState(false);
  const [showMPINDialog, setShowMPINDialog] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showPayLoanDialog, setShowPayLoanDialog] = useState(false);
  const [showManageFDDialog, setShowManageFDDialog] = useState(false);
  const [fdLoading, setFdLoading] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<{
    toUserName: string;
    amount: number;
  } | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      if (!session?.user?.id) return;
      const res = await fetch(`/api/users/${session.user.id}`);
      const userData = await res.json();
      setUser(userData.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  async function completeTransfer(
    toUserName: string,
    amount: number,
    mpin: string
  ) {
    if (!user) return;
    setMpinLoading(true);
    try {
      const res = await fetch(TRANSFER_ENDPOINTS.TRANSFER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: user._id,
          toUserName,
          amount,
          mpin,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Transfer successful`);
        await fetchUserData();
        setTimeout(() => {
          setMessage('');
          setPendingTransfer(null);
        }, TRANSFER_CONFIG.RESET_DELAY);
      } else {
        setMessage(`❌ ${data.error || 'Transfer failed'}`);
      }
    } finally {
      setMpinLoading(false);
      setShowMPINDialog(false);
    }
  }

  const handleMPINVerify = async (mpin: string) => {
    if (!pendingTransfer) return;
    await completeTransfer(
      pendingTransfer.toUserName,
      pendingTransfer.amount,
      mpin
    );
  };

  const handleTransferFormSubmit = (toUserName: string, amount: number) => {
    setPendingTransfer({ toUserName, amount });
    setShowTransferForm(false);
    setShowMPINDialog(true);
  };

  async function payLoan(amount: number) {
    if (!user) return;
    setFdLoading(true);
    try {
      const res = await fetch('/api/transactions/pay-loan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, amount }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Loan repayment of ₹${amount} successful`);
        await fetchUserData();
        setTimeout(() => {
          setMessage('');
          setShowPayLoanDialog(false);
        }, TRANSFER_CONFIG.RESET_DELAY);
      } else {
        setMessage(`❌ ${data.error || 'Loan payment failed'}`);
      }
    } catch (error) {
      setMessage(
        `❌ ${error instanceof Error ? error.message : 'Loan payment failed'}`
      );
    } finally {
      setFdLoading(false);
    }
  }

  async function transferToFD(amount: number) {
    if (!user) return;
    setFdLoading(true);
    try {
      const res = await fetch('/api/transactions/transfer-fd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, amount }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ₹${amount} transferred to FD successfully`);
        await fetchUserData();
        setTimeout(() => {
          setMessage('');
          setShowManageFDDialog(false);
        }, TRANSFER_CONFIG.RESET_DELAY);
      } else {
        setMessage(`❌ ${data.error || 'Transfer to FD failed'}`);
      }
    } catch (error) {
      setMessage(
        `❌ ${error instanceof Error ? error.message : 'Transfer to FD failed'}`
      );
    } finally {
      setFdLoading(false);
    }
  }

  async function withdrawFromFD(amount: number) {
    if (!user) return;
    setFdLoading(true);
    try {
      const res = await fetch('/api/transactions/withdraw-fd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, amount }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ₹${amount} withdrawn from FD successfully`);
        await fetchUserData();
        setTimeout(() => {
          setMessage('');
          setShowManageFDDialog(false);
        }, TRANSFER_CONFIG.RESET_DELAY);
      } else {
        setMessage(`❌ ${data.error || 'Withdrawal from FD failed'}`);
      }
    } catch (error) {
      setMessage(
        `❌ ${error instanceof Error ? error.message : 'Withdrawal from FD failed'}`
      );
    } finally {
      setFdLoading(false);
    }
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
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Online Transfer
            </span>
          </h1>
          <p className="text-gray-200 text-lg">
            Transfer money and manage your accounts
          </p>
        </div>

        {message && (
          <p
            className={`p-3 rounded-lg text-sm mb-8 ${
              message.includes('❌')
                ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                : 'bg-green-500/10 border border-green-500/30 text-green-400'
            }`}
          >
            {message}
          </p>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="/user/qr-transfer">
            <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-400/30 hover:border-green-400/50 transition cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <QrCode size={24} />
                  QR Transfer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  Scan QR code to transfer
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card
            onClick={() => setShowTransferForm(true)}
            className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-400/30 hover:border-purple-400/50 transition cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Send size={24} />
                Direct Transfer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">Send to another user</p>
            </CardContent>
          </Card>

          <Card
            onClick={() => setShowManageFDDialog(true)}
            className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-400/30 hover:border-blue-400/50 transition cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <DollarSign size={24} />
                Manage FD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">Fixed Deposit options</p>
            </CardContent>
          </Card>

          <Card
            onClick={() => setShowPayLoanDialog(true)}
            className="bg-gradient-to-br from-red-900/30 to-rose-900/30 border-red-400/30 hover:border-red-400/50 transition cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <CreditCard size={24} />
                Pay Loan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm">Repay your loan</p>
            </CardContent>
          </Card>
        </div>

        {/* Account Summary */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400">Account Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Savings</p>
                <p className="text-2xl font-bold text-green-400">
                  ₹{(user.savingsBalance || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">FD Balance</p>
                <p className="text-2xl font-bold text-blue-400">
                  ₹{(user.fd || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Loan</p>
                <p className="text-2xl font-bold text-red-400">
                  ₹{(user.loanBalance || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Net Worth</p>
                <p className="text-2xl font-bold text-purple-400">
                  ₹
                  {(
                    (user.savingsBalance || 0) - (user.loanBalance || 0)
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MPIN Dialog */}
        {user?._id && (
          <MPINVerificationDialog
            isOpen={showMPINDialog}
            onClose={() => {
              setShowMPINDialog(false);
              setPendingTransfer(null);
            }}
            onVerify={handleMPINVerify}
            isLoading={mpinLoading}
          />
        )}

        {/* Money Transfer Form Dialog */}
        {user && (
          <MoneyTransferForm
            open={showTransferForm}
            onOpenChange={setShowTransferForm}
            loading={mpinLoading}
            onSubmit={handleTransferFormSubmit}
            title="Direct Transfer"
            description="Enter recipient details to send money"
            icon={<Send size={20} />}
            maxAmount={user.savingsBalance}
          />
        )}

        {/* Pay Loan Dialog */}
        {user && (
          <PayLoanDialog
            open={showPayLoanDialog}
            onOpenChange={setShowPayLoanDialog}
            loading={fdLoading}
            onSubmit={payLoan}
            maxAmount={user.savingsBalance || 0}
            loanBalance={user.loanBalance || 0}
          />
        )}

        {/* Manage FD Dialog */}
        {user && (
          <ManageFDDialog
            open={showManageFDDialog}
            onOpenChange={setShowManageFDDialog}
            loading={fdLoading}
            onTransferToFD={transferToFD}
            onWithdrawFromFD={withdrawFromFD}
            savingsBalance={user.savingsBalance || 0}
            fdBalance={user.fd || 0}
          />
        )}
      </div>
    </main>
  );
}
