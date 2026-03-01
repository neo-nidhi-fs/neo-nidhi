'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Loader } from 'lucide-react';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { NoChallengesMessage } from '@/components/challenges/NoChallengesMessage';
import UserJoinedChallenges from '@/components/UserJoinedChallenges';

type Challenge = {
  _id: string;
  title: string;
  description: string;
  category: 'finance' | 'general';
  questionCount: number;
  registrationFee: number;
  maxParticipants: number;
  currentParticipants: number;
  status: 'registration' | 'started' | 'completed' | 'cancelled';
  totalPrizePool: number;
  createdBy: { _id: string; name: string };
};

type UserChallenge = {
  challengeId: string;
  status: 'registered' | 'started' | 'completed';
};

export default function ChallengesPage() {
  const { data: session } = useSession();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/challenges');
      const data = await res.json();
      if (data.success) {
        setChallenges(data.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserChallenges = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/challenges/user/${session.user.id}`);
      const data = await res.json();
      if (data.success) {
        setUserChallenges(data.data);
      }
    } catch (error) {
      console.error('Error fetching user challenges:', error);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchChallenges();
    fetchUserChallenges();
  }, [fetchChallenges, fetchUserChallenges]);

  const handleJoinChallenge = async (challengeId: string) => {
    if (!session?.user?.id) return;

    setJoinLoading(challengeId);
    try {
      const res = await fetch('/api/challenges/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, userId: session.user.id }),
      });

      const data = await res.json();
      const msg = res.ok ? '✅ Successfully joined challenge!' : `❌ ${data.error}`;
      setMessage(msg);
      setTimeout(() => setMessage(''), 3000);

      if (res.ok) {
        fetchChallenges();
        fetchUserChallenges();
      }
    } catch (error) {
      setMessage('❌ Error joining challenge');
      setTimeout(() => setMessage(''), 3000);
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

  const registrationChallenges = challenges.filter((c) => c.status === 'registration');
  const userJoinedChallenges = challenges.filter((c) =>
    userChallenges.some(
      (uc) => uc.challengeId === c._id && ['registered', 'started'].includes(uc.status)
    )
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12 min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <Loader className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Quiz Challenges
            </span>
          </h1>
          <p className="text-gray-200 text-lg">
            Compete with other users, earn rewards, and climb the rankings
          </p>

          {message && (
            <p
              className={`mt-4 p-3 rounded-lg text-sm inline-block ${
                message.includes('❌')
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : 'bg-green-500/10 border border-green-500/30 text-green-400'
              }`}
            >
              {message}
            </p>
          )}
        </div>

        <UserJoinedChallenges
          userJoinedChallenges={userJoinedChallenges}
          userChallenges={userChallenges}
        />

        <div>
          <h2 className="text-2xl font-bold text-purple-400 mb-6">Available Challenges</h2>
          {registrationChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {registrationChallenges.map((challenge) => {
                const isAlreadyJoined = userChallenges.some(
                  (uc) => uc.challengeId === challenge._id
                );
                const isFull = challenge.currentParticipants >= challenge.maxParticipants;

                return (
                  <ChallengeCard
                    key={challenge._id}
                    challenge={challenge}
                    isAlreadyJoined={isAlreadyJoined}
                    isFull={isFull}
                    isLoading={joinLoading === challenge._id}
                    onJoin={() => handleJoinChallenge(challenge._id)}
                  />
                );
              })}
            </div>
          ) : (
            <NoChallengesMessage />
          )}
        </div>
      </div>
    </main>
  );
}
