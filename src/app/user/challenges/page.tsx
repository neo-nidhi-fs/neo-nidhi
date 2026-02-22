'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trophy, Plus, Users, Loader } from 'lucide-react';
import Link from 'next/link';

type Challenge = {
  _id: string;
  title: string;
  description: string;
  category: 'finance' | 'general';
  registrationFee: number;
  maxParticipants: number;
  currentParticipants: number;
  status: 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  createdBy: { _id: string; name: string };
  totalPrizePool: number;
};

export default function ChallengesPage() {
  const { data: session } = useSession();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'active' | 'all'>('active');

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/challenges?status=${filter === 'active' ? 'active' : 'completed'}`
      );
      const data = await res.json();
      if (data.success) {
        setChallenges(data.data);
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchChallenges();
  }, [filter, fetchChallenges]);

  const handleCreateChallenge = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setCreateLoading(true);
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString();
    const category = formData.get('category')?.toString() as
      | 'finance'
      | 'general';
    const registrationFee = Number(formData.get('registrationFee'));
    const maxParticipants = Number(formData.get('maxParticipants'));

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          title,
          description,
          category,
          registrationFee,
          maxParticipants,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Challenge created successfully');
        setTimeout(() => setCreateDialogOpen(false), 1500);
        fetchChallenges();
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    if (!session?.user?.id) return;

    setJoinLoading(challengeId);
    try {
      const res = await fetch('/api/challenges/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          userId: session.user.id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => setMessage(''), 2000);
        fetchChallenges();
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } finally {
      setJoinLoading(null);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">Please log in to join challenges</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <Loader className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Quiz Challenges
            </span>
          </h1>
          <p className="text-gray-200 text-lg mb-6">
            Compete with other users, earn rewards, and climb the rankings
          </p>

          <div className="flex gap-4 flex-wrap">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2">
                  <Plus size={18} />
                  Create Challenge
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Create New Challenge
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateChallenge} className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-gray-100">
                      Challenge Title
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Finance Expert Challenge"
                      required
                      disabled={createLoading}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-gray-100">
                      Description (optional)
                    </Label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Add a description"
                      disabled={createLoading}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-gray-100">
                      Category
                    </Label>
                    <select
                      id="category"
                      name="category"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded disabled:opacity-50"
                      disabled={createLoading}
                    >
                      <option value="finance">Finance</option>
                      <option value="general">General Knowledge</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="fee" className="text-gray-100">
                        Registration Fee (₹)
                      </Label>
                      <Input
                        id="fee"
                        name="registrationFee"
                        type="number"
                        min="1"
                        placeholder="10"
                        required
                        disabled={createLoading}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="max" className="text-gray-100">
                        Max Participants
                      </Label>
                      <Input
                        id="max"
                        name="maxParticipants"
                        type="number"
                        min="2"
                        placeholder="10"
                        required
                        disabled={createLoading}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={createLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {createLoading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Challenge'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Link href="/user/quiz">
              <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                Take a Quiz
              </Button>
            </Link>
          </div>

          {message && (
            <p
              className={`mt-4 p-3 rounded-lg text-sm ${
                message.includes('Error') || message.includes('❌')
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : 'bg-green-500/10 border border-green-500/30 text-green-400'
              }`}
            >
              {message}
            </p>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setFilter('active')}
            className={`${
              filter === 'active'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
            }`}
          >
            Active
          </Button>
          <Button
            onClick={() => setFilter('all')}
            className={`${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
            }`}
          >
            Completed
          </Button>
        </div>

        {/* Challenges Grid */}
        {challenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((challenge) => (
              <Card
                key={challenge._id}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 hover:border-purple-400/50 transition"
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-purple-400 text-lg">
                        {challenge.title}
                      </CardTitle>
                      <p className="text-sm text-gray-400 mt-1">
                        by {challenge.createdBy.name}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        challenge.status === 'active'
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-slate-900/30 text-gray-400'
                      }`}
                    >
                      {challenge.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {challenge.description && (
                    <p className="text-gray-300 text-sm">
                      {challenge.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-700/30 rounded p-3">
                      <p className="text-xs text-gray-400">Registration Fee</p>
                      <p className="text-lg font-bold text-blue-400">
                        ₹{challenge.registrationFee}
                      </p>
                    </div>

                    <div className="bg-slate-700/30 rounded p-3">
                      <p className="text-xs text-gray-400">Prize Pool</p>
                      <p className="text-lg font-bold text-green-400">
                        ₹{challenge.totalPrizePool}
                      </p>
                    </div>

                    <div className="bg-slate-700/30 rounded p-3">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Users size={14} /> Participants
                      </p>
                      <p className="text-lg font-bold text-purple-400">
                        {challenge.currentParticipants}/
                        {challenge.maxParticipants}
                      </p>
                    </div>

                    <div className="bg-slate-700/30 rounded p-3">
                      <p className="text-xs text-gray-400">Category</p>
                      <p className="text-lg font-bold text-cyan-400 capitalize">
                        {challenge.category}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded p-3 text-xs text-gray-300">
                    <p>
                      <strong>Rewards:</strong> 50% to winner, 30% to 2nd, 10%
                      to 3rd, 10% to admin
                    </p>
                  </div>

                  <Button
                    onClick={() => handleJoinChallenge(challenge._id)}
                    disabled={
                      challenge.status !== 'active' ||
                      challenge.currentParticipants >=
                        challenge.maxParticipants ||
                      joinLoading === challenge._id
                    }
                    className={`w-full ${
                      challenge.status === 'active' &&
                      challenge.currentParticipants < challenge.maxParticipants
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        : 'bg-slate-700 cursor-not-allowed opacity-50'
                    } text-white font-semibold flex items-center justify-center gap-2`}
                  >
                    {joinLoading === challenge._id ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Joining...
                      </>
                    ) : challenge.status === 'completed' ? (
                      <>
                        <Trophy size={18} />
                        Completed
                      </>
                    ) : challenge.currentParticipants >=
                      challenge.maxParticipants ? (
                      'Challenge Full'
                    ) : (
                      <>
                        <Trophy size={18} />
                        Join Challenge
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 text-center">
            <CardContent className="pt-12 pb-12">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-6">
                {filter === 'active'
                  ? 'No active challenges yet. Be the first to create one!'
                  : 'No completed challenges yet.'}
              </p>
              {filter === 'active' && (
                <Dialog
                  open={createDialogOpen}
                  onOpenChange={setCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2 mx-auto">
                      <Plus size={18} />
                      Create Challenge
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
