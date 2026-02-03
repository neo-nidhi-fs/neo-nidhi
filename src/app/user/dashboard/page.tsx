'use client';

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
import { Wallet, Banknote, TrendingDown, Send, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UserDashboard() {
  const [user, setUser] = useState({
    name: '',
    savingsBalance: 0,
    loanBalance: 0,
    _id: '',
    fd: 0,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const oldPassword = formData.get('oldPassword')?.toString();
    const newPassword = formData.get('newPassword')?.toString();

    const res = await fetch(`/api/users/${user?._id}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('✅ Password updated successfully');
    } else {
      setMessage(`❌ Error: ${data.error}`);
    }
  }

  async function handleTransferMoney(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const toUserName = formData.get('toUserName')?.toString();
    const amount = Number(formData.get('amount'));

    const res = await fetch('/api/transactions/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromUserId: user._id,
        toUserName,
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
      e.currentTarget.reset();
    } else {
      setMessage(`❌ Error: ${data.error}`);
    }
  }

  async function handlePayLoan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('loanAmount'));

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
      e.currentTarget.reset();
    } else {
      setMessage(`❌ Error: ${data.error}`);
    }
  }

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch('/api/auth/session');
      const session = await res.json();

      if (session?.user?.id) {
        const userRes = await fetch(`/api/users/${session.user.id}`);
        const userData = await userRes.json();
        setUser(userData.data);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">Loading dashboard...</p>
      </div>
    );
  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">User not found</p>
      </div>
    );

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-2">
            Welcome,{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {user.name}
            </span>
            👋
          </h1>
          <p className="text-gray-200 text-lg">
            Manage your finances and track your progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Savings Card */}
          <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-400/30 hover:border-green-400/50 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-green-400">
                  Savings Balance
                </CardTitle>
                <Wallet className="text-green-400" size={24} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-300">
                ₹{user.savingsBalance.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* Fixed Deposit Card */}
          <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-400/30 hover:border-blue-400/50 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-blue-400">
                  Fixed Deposit
                </CardTitle>
                <Banknote className="text-blue-400" size={24} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-300">
                ₹{(user.fd || 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* Loan Balance Card */}
          <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-400/30 hover:border-orange-400/50 transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-orange-400">
                  Loan Balance
                </CardTitle>
                <TrendingDown className="text-orange-400" size={24} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-300">
                ₹{user.loanBalance.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Password Change Dialog */}
        <div className="space-y-4 mb-12">
          <div className="flex gap-4 flex-wrap">
            {/* Change Password Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-6">
                  🔑 Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Update Your Password
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <Label htmlFor="oldPassword" className="text-gray-100">
                      Old Password
                    </Label>
                    <Input
                      id="oldPassword"
                      name="oldPassword"
                      type="password"
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword" className="text-gray-100">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold"
                  >
                    Update Password
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Transfer Money Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 flex items-center gap-2">
                  <Send size={18} />
                  Transfer Money
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
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
                      className="bg-slate-700 border-slate-600 text-white"
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
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
                  >
                    Transfer
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Pay Loan Dialog */}
            {user.loanBalance > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-6 flex items-center gap-2">
                    <CreditCard size={18} />
                    Pay Loan
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Pay Loan from Savings
                    </DialogTitle>
                  </DialogHeader>
                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-300">
                      Loan Balance:{' '}
                      <span className="font-bold text-orange-400">
                        ₹{user.loanBalance.toLocaleString()}
                      </span>
                    </p>
                    <p className="text-sm text-gray-300">
                      Available Balance:{' '}
                      <span className="font-bold text-green-400">
                        ₹{user.savingsBalance.toLocaleString()}
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
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold"
                    >
                      Pay Loan
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {message && (
            <p
              className={`p-3 rounded-lg text-sm ${
                message.includes('Error') || message.includes('❌')
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : 'bg-green-500/10 border border-green-500/30 text-green-400'
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
