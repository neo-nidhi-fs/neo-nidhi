'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy, Users, Loader, CheckCircle } from 'lucide-react';
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
      console.log('data ==> ', data);
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
        body: JSON.stringify({
          challengeId,
          userId: session.user.id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Successfully joined challenge!');
        setTimeout(() => setMessage(''), 3000);
        fetchChallenges();
        fetchUserChallenges();
      } else {
        setMessage(`❌ ${data.error}`);
        setTimeout(() => setMessage(''), 3000);
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

  const registrationChallenges = challenges.filter(
    (c) => c.status === 'registration'
  );
  const userJoinedChallenges = challenges.filter((c) =>
    userChallenges.some(
      (uc) =>
        uc.challengeId === c._id &&
        (uc.status === 'registered' || uc.status === 'started')
    )
  );

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

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : (
          <>
            {/* Your Challenges */}
            <UserJoinedChallenges
              userJoinedChallenges={userJoinedChallenges}
              userChallenges={userChallenges}
            />

            {/* Available Challenges */}
            <div>
              <h2 className="text-2xl font-bold text-purple-400 mb-6">
                Available Challenges
              </h2>
              {registrationChallenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {registrationChallenges.map((challenge) => {
                    const isAlreadyJoined = userChallenges.some(
                      (uc) => uc.challengeId === challenge._id
                    );
                    const isFull =
                      challenge.currentParticipants >=
                      challenge.maxParticipants;

                    return (
                      <Card
                        key={challenge._id}
                        className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 hover:border-purple-400/50 transition"
                      >
                        <CardHeader>
                          <div>
                            <CardTitle className="text-purple-400 text-lg">
                              {challenge.title}
                            </CardTitle>
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
                              <p className="text-xs text-gray-400">
                                Registration Fee
                              </p>
                              <p className="text-lg font-bold text-blue-400">
                                ₹{challenge.registrationFee}
                              </p>
                            </div>

                            <div className="bg-slate-700/30 rounded p-3">
                              <p className="text-xs text-gray-400">
                                Prize Pool
                              </p>
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

                          <Button
                            onClick={() => handleJoinChallenge(challenge._id)}
                            disabled={
                              isAlreadyJoined ||
                              isFull ||
                              joinLoading === challenge._id
                            }
                            className={`w-full ${
                              !isAlreadyJoined && !isFull
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                                : 'bg-slate-700 cursor-not-allowed opacity-50'
                            } text-white font-semibold flex items-center justify-center gap-2`}
                          >
                            {joinLoading === challenge._id ? (
                              <>
                                <Loader size={18} className="animate-spin" />
                                Joining...
                              </>
                            ) : isAlreadyJoined ? (
                              <>
                                <CheckCircle size={18} />
                                Already Joined
                              </>
                            ) : isFull ? (
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
                    );
                  })}
                </div>
              ) : (
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 text-center">
                  <CardContent className="pt-12 pb-12">
                    <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">
                      No challenges available at the moment.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
