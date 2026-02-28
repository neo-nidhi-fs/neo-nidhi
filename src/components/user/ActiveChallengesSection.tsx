'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

interface Challenge {
  _id: string;
  title: string;
  totalPrizePool: number;
}

export function ActiveChallengesSection({
  challenges,
  loading,
}: {
  challenges: Challenge[];
  loading: boolean;
}) {
  if (loading || challenges.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-purple-400 mb-6">
        Active Challenges
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((challenge) => (
          <Card
            key={challenge._id}
            className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-400/30 hover:border-purple-400/50 transition-all duration-300"
          >
            <CardHeader>
              <CardTitle className="text-purple-400">{challenge.title}</CardTitle>
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
  );
}
