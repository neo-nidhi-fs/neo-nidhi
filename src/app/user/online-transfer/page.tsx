'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Send,
  Banknote,
  TrendingDown,
  CreditCard,
  Loader,
  ArrowLeft,
  QrCode,
} from 'lucide-react';
import MPINVerificationDialog from '@/components/MPINVerificationDialog';

export default function OnlineTransferPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState({
    name: '',
    savingsBalance: 0,
    loanBalance: 0,
    _id: '',
    fd: 0,
    mpin: null as string | null,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [fdTransferLoading, setFdTransferLoading] = useState(false);
  const [fdWithdrawLoading, setFdWithdrawLoading] = useState(false);
  const [loanLoading, setLoanLoading] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [fdTransferDialogOpen, setFdTransferDialogOpen] = useState(false);
  const [fdWithdrawDialogOpen, setFdWithdrawDialogOpen] = useState(false);
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [showMPINDialog, setShowMPINDialog] = useState(false);
  const [mpinLoading, setMpinLoading] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<{
    toUserName: string;
    amount: number;
  } | null>(null);
  const [fdWithdrawInfo, setFdWithdrawInfo] = useState({
    matureAmount: 0,
    prematureAmount: 0,
    totalFd: 0,
    matureTransactions: [] as {
      amount: number;
      date: Date;
      yearsOld: number;
    }[],
    prematureTransactions: [] as {
      amount: number;
      date: Date;
      yearsOld: number;
    }[],
  });

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch('/api/auth/session');
      const sessionData = await res.json();

      if (sessionData?.user?.id) {
        const userRes = await fetch(`/api/users/${sessionData.user.id}`);
        const userData = await userRes.json();
        setUser(userData.data);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  async function handleTransferMoney(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const toUserName = formData.get('toUserName')?.toString().trim();
    const amount = Number(formData.get('amount'));

    if (!toUserName || !amount) {
      setMessage('❌ Error: Please fill in all fields');
      return;
    }

    // If user has MPIN, show verification dialog
    if (user.mpin) {
      setPendingTransfer({ toUserName, amount });
      setShowMPINDialog(true);
    } else {
      // If no MPIN, proceed directly (for backward compatibility)
      await completeTransfer(toUserName, amount, '');
    }
  }

  async function completeTransfer(
    toUserName: string,
    amount: number,
    mpin: string
  ) {
    setTransferLoading(true);
    try {
      const res = await fetch('/api/transactions/transfer', {
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
        setMessage(`✅ ${data.message}`);
        // Refresh user data
        const userRes = await fetch(`/api/users/${user._id}`);
        const userData = await userRes.json();
        setUser(userData.data);

        setTimeout(() => {
          setTransferDialogOpen(false);
          setPendingTransfer(null);
        }, 1500);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } finally {
      setTransferLoading(false);
    }
  }

  const handleMPINVerify = async (mpin: string) => {
    if (!pendingTransfer) return;
    setMpinLoading(true);
    try {
      await completeTransfer(
        pendingTransfer.toUserName,
        pendingTransfer.amount,
        mpin
      );
      setShowMPINDialog(false);
    } finally {
      setMpinLoading(false);
    }
  };

  async function handleTransferToFd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFdTransferLoading(true);
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('fdAmount'));

    try {
      const res = await fetch('/api/transactions/transfer-fd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          amount,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        // Refresh user data
        const userRes = await fetch(`/api/users/${user._id}`);
        const userData = await userRes.json();
        setUser(userData.data);

        setTimeout(() => setFdTransferDialogOpen(false), 1500);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } finally {
      setFdTransferLoading(false);
    }
  }

  async function fetchFdWithdrawInfo() {
    try {
      const res = await fetch(
        `/api/transactions/withdraw-fd?userId=${user._id}`
      );
      const data = await res.json();
      if (res.ok) {
        setFdWithdrawInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching FD info:', error);
    }
  }

  async function handleWithdrawFd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFdWithdrawLoading(true);
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('withdrawAmount'));

    try {
      const res = await fetch('/api/transactions/withdraw-fd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          amount,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        // Refresh user data
        const userRes = await fetch(`/api/users/${user._id}`);
        const userData = await userRes.json();
        setUser(userData.data);

        setTimeout(() => setFdWithdrawDialogOpen(false), 1500);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } finally {
      setFdWithdrawLoading(false);
    }
  }

  async function handlePayLoan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoanLoading(true);
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('loanAmount'));

    try {
      const res = await fetch('/api/transactions/pay-loan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          amount,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        // Refresh user data
        const userRes = await fetch(`/api/users/${user._id}`);
        const userData = await userRes.json();
        setUser(userData.data);

        setTimeout(() => setLoanDialogOpen(false), 1500);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } finally {
      setLoanLoading(false);
    }
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">Please log in to access transfers</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">Loading...</p>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/user/dashboard">
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Online Transfer
            </span>
          </h1>
          <p className="text-gray-200 text-lg">
            Transfer money, manage FD, and pay loans
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* QR Transfer */}
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
                  Scan QR code to transfer money instantly
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Transfer Money */}
          <Dialog
            open={transferDialogOpen}
            onOpenChange={setTransferDialogOpen}
          >
            <DialogTrigger asChild>
              <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-400/30 hover:border-purple-400/50 transition cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <Send size={24} />
                    Transfer Money
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm">
                    Send money to another user
                  </p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Transfer Money to Another User
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleTransferMoney} className="space-y-4">
                <div>
                  <Label htmlFor="toUserName" className="text-gray-100">
                    Recipient Name
                  </Label>
                  <Input
                    id="toUserName"
                    name="toUserName"
                    type="text"
                    placeholder="Enter recipient username"
                    required
                    disabled={transferLoading}
                    className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <Label htmlFor="amount" className="text-gray-100">
                    Amount (₹)
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                    disabled={transferLoading}
                    className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={transferLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {transferLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Transfer'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Transfer to FD */}
          <Dialog
            open={fdTransferDialogOpen}
            onOpenChange={setFdTransferDialogOpen}
          >
            <DialogTrigger asChild>
              <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-400/30 hover:border-blue-400/50 transition cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <Banknote size={24} />
                    Transfer to FD
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm">
                    Move savings to Fixed Deposit
                  </p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Transfer to Fixed Deposit
                </DialogTitle>
              </DialogHeader>
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-300">
                  Available Balance:{' '}
                  <span className="font-bold text-green-400">
                    ₹{user.savingsBalance.toFixed(2)}
                  </span>
                </p>
                <p className="text-sm text-gray-300">
                  Current FD:{' '}
                  <span className="font-bold text-blue-400">
                    ₹{(user.fd || 0).toFixed(2)}
                  </span>
                </p>
              </div>
              <form onSubmit={handleTransferToFd} className="space-y-4">
                <div>
                  <Label htmlFor="fdAmount" className="text-gray-100">
                    Amount to Transfer (₹)
                  </Label>
                  <Input
                    id="fdAmount"
                    name="fdAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={user.savingsBalance}
                    placeholder="0.00"
                    required
                    disabled={fdTransferLoading}
                    className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={fdTransferLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {fdTransferLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Transfer to FD'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Withdraw FD */}
          <Dialog
            open={fdWithdrawDialogOpen}
            onOpenChange={setFdWithdrawDialogOpen}
          >
            <DialogTrigger asChild>
              <div onClick={fetchFdWithdrawInfo}>
                <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-400/30 hover:border-orange-400/50 transition cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-orange-400 flex items-center gap-2">
                      <TrendingDown size={24} />
                      Withdraw FD
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm">
                      Withdraw from Fixed Deposit
                    </p>
                  </CardContent>
                </Card>
              </div>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Withdraw from Fixed Deposit
                </DialogTitle>
              </DialogHeader>
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 mb-4 space-y-3">
                <p className="text-sm text-gray-300">
                  Total FD:{' '}
                  <span className="font-bold text-blue-400">
                    ₹{fdWithdrawInfo.totalFd.toFixed(2)}
                  </span>
                </p>
                <p className="text-sm text-gray-300">
                  Mature Amount (No penalty):{' '}
                  <span className="font-bold text-green-400">
                    ₹{fdWithdrawInfo.matureAmount.toFixed(2)}
                  </span>
                </p>
                <p className="text-sm text-gray-300">
                  Premature Amount (With penalty):{' '}
                  <span className="font-bold text-orange-400">
                    ₹{fdWithdrawInfo.prematureAmount.toFixed(2)}
                  </span>
                </p>
              </div>
              <form onSubmit={handleWithdrawFd} className="space-y-4">
                <div>
                  <Label htmlFor="withdrawAmount" className="text-gray-100">
                    Amount to Withdraw (₹)
                  </Label>
                  <Input
                    id="withdrawAmount"
                    name="withdrawAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={
                      fdWithdrawInfo.matureAmount +
                      fdWithdrawInfo.prematureAmount
                    }
                    placeholder="0.00"
                    required
                    disabled={fdWithdrawLoading}
                    className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={fdWithdrawLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {fdWithdrawLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Withdraw'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Pay Loan */}
          <Dialog open={loanDialogOpen} onOpenChange={setLoanDialogOpen}>
            <DialogTrigger asChild>
              <Card className="bg-gradient-to-br from-red-900/30 to-rose-900/30 border-red-400/30 hover:border-red-400/50 transition cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <CreditCard size={24} />
                    Pay Loan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm">
                    Repay your loan with interest
                  </p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-white">Pay Your Loan</DialogTitle>
              </DialogHeader>
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-300">
                  Loan Balance:{' '}
                  <span className="font-bold text-red-400">
                    ₹{user.loanBalance.toFixed(2)}
                  </span>
                </p>
                <p className="text-sm text-gray-300 mt-2">
                  Available Balance:{' '}
                  <span className="font-bold text-green-400">
                    ₹{user.savingsBalance.toFixed(2)}
                  </span>
                </p>
              </div>
              <form onSubmit={handlePayLoan} className="space-y-4">
                <div>
                  <Label htmlFor="loanAmount" className="text-gray-100">
                    Amount to Pay (₹)
                  </Label>
                  <Input
                    id="loanAmount"
                    name="loanAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={Math.min(user.loanBalance, user.savingsBalance)}
                    placeholder="0.00"
                    required
                    disabled={loanLoading}
                    className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loanLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loanLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Pay Loan'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Message Display */}
        {message && (
          <p
            className={`p-3 rounded-lg text-sm mb-8 ${
              message.includes('Error') || message.includes('❌')
                ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                : 'bg-green-500/10 border border-green-500/30 text-green-400'
            }`}
          >
            {message}
          </p>
        )}

        {/* Info Section */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400">
              Your Account Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Savings Balance</p>
                <p className="text-2xl font-bold text-green-400">
                  ₹{user.savingsBalance.toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Fixed Deposit</p>
                <p className="text-2xl font-bold text-blue-400">
                  ₹{(user.fd || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Loan Balance</p>
                <p className="text-2xl font-bold text-red-400">
                  ₹{user.loanBalance.toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Total Worth</p>
                <p className="text-2xl font-bold text-purple-400">
                  ₹
                  {(user.savingsBalance + user.fd - user.loanBalance).toFixed(
                    2
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MPIN Verification Dialog */}
      <MPINVerificationDialog
        isOpen={showMPINDialog}
        onClose={() => {
          setShowMPINDialog(false);
          setPendingTransfer(null);
        }}
        onVerify={handleMPINVerify}
        isLoading={mpinLoading}
        title="Enter MPIN"
        description="Enter your 4-digit MPIN to confirm this transfer"
      />
    </main>
  );
}
