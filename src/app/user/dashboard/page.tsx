'use client';

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
  Wallet,
  Banknote,
  TrendingDown,
  Loader,
  BarChart3,
  Trophy,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import SetMPINDialog from '@/components/SetMPINDialog';
import QRCodeDisplay from '@/components/QRCodeDisplay';

export default function UserDashboard() {
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
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [activeChallenges, setActiveChallenges] = useState<
    {
      _id: string;
      title: string;
      totalPrizePool: number;
    }[]
  >([]);
  console.log('activeChallenges ==> ', activeChallenges);

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordLoading(true);
    const formData = new FormData(e.currentTarget);
    const oldPassword = formData.get('oldPassword')?.toString();
    const newPassword = formData.get('newPassword')?.toString();

    try {
      const res = await fetch(`/api/users/${user?._id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Password updated successfully');

        setTimeout(() => setPasswordDialogOpen(false), 1500);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } finally {
      setPasswordLoading(false);
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

        // Fetch user's active challenges
        fetchActiveChallenges(session.user.id);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  const fetchActiveChallenges = async (userId: string) => {
    try {
      // Get all challenges
      const challengesRes = await fetch('/api/challenges');
      const challengesData = await challengesRes.json();

      // Get user's challenge participations
      const participationRes = await fetch(`/api/challenges/user/${userId}`);
      const participationData = await participationRes.json();

      if (
        challengesData.success &&
        participationData.success &&
        participationData.data.length > 0
      ) {
        // Filter challenges that are 'started' and user has participated in
        const active = challengesData.data.filter(
          (challenge: {
            _id: string;
            status: string;
            title: string;
            totalPrizePool?: number;
          }) =>
            challenge.status === 'started' &&
            participationData.data.some(
              (p: { challengeId: string; status: string }) =>
                p.challengeId === challenge._id && p.status === 'started'
            )
        );

        setActiveChallenges(
          active.map(
            (c: { _id: string; title: string; totalPrizePool?: number }) => ({
              _id: c._id,
              title: c.title,
              totalPrizePool: c.totalPrizePool,
            })
          )
        );
      }
    } catch (error) {
      console.error('Error fetching active challenges:', error);
    }
  };

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
          <p className="text-gray-200 text-lg mb-4">
            Manage your finances and track your progress
          </p>
          <Link href="/user/reports">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 flex items-center gap-2">
              <BarChart3 size={18} />
              View Your Reports
            </Button>
          </Link>
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
                ₹{user.savingsBalance.toFixed(2)}
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
                ₹{(user.fd || 0).toFixed(2)}
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
                ₹{user.loanBalance.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Challenges Section */}
        {activeChallenges.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-purple-400 mb-6">
              Active Challenges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeChallenges.map((challenge) => (
                <Card
                  key={challenge._id}
                  className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-400/30 hover:border-purple-400/50 transition-all duration-300"
                >
                  <CardHeader>
                    <CardTitle className="text-purple-400">
                      {challenge.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-slate-700/30 p-3 rounded">
                      <p className="text-xs text-gray-400">Prize Pool</p>
                      <p className="text-2xl font-bold text-purple-300">
                        ₹{challenge.totalPrizePool}
                      </p>
                    </div>
                    <Link href={`/user/challenges/${challenge._id}`}>
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 flex items-center justify-center gap-2">
                        <Trophy size={18} />
                        Start {challenge.title}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Password Change Dialog */}
        <div className="space-y-4 mb-12">
          <div className="flex gap-4 flex-wrap">
            {/* Change Password Dialog */}
            <Dialog
              open={passwordDialogOpen}
              onOpenChange={setPasswordDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-6">
                  🔑 Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
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
                      disabled={passwordLoading}
                      className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
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
                      disabled={passwordLoading}
                      className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {passwordLoading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Set MPIN Dialog */}
            <SetMPINDialog
              userId={user._id}
              hasMPIN={user.mpin !== null && user.mpin !== undefined}
              onMPINSet={() => {
                // Refresh user data to show MPIN is set
                fetch(`/api/users/${user._id}`)
                  .then((res) => res.json())
                  .then((data) => setUser(data.data));
              }}
            />

            {/* QR Code Display */}
            <QRCodeDisplay userId={user._id} userName={user.name} />
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
