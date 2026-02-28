'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users, CheckCircle, Loader } from 'lucide-react';

interface Challenge {
  _id: string;
  title: string;
  description?: string;
  registrationFee: number;
  totalPrizePool: number;
  currentParticipants: number;
  maxParticipants: number;
  category: string;
}

interface ChallengeCardProps {
  challenge: Challenge;
  isAlreadyJoined: boolean;
  isFull: boolean;
  isLoading: boolean;
  onJoin: () => void;
}

export function ChallengeCard({
  challenge,
  isAlreadyJoined,
  isFull,
  isLoading,
  onJoin,
}: ChallengeCardProps) {
  const isDisabled = isAlreadyJoined || isFull || isLoading;

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 hover:border-purple-400/50 transition">
      <CardHeader>
        <CardTitle className="text-purple-400 text-lg">{challenge.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenge.description && (
          <p className="text-gray-300 text-sm">{challenge.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700/30 rounded p-3">
            <p className="text-xs text-gray-400">Registration Fee</p>
            <p className="text-lg font-bold text-blue-400">₹{challenge.registrationFee}</p>
          </div>
          <div className="bg-slate-700/30 rounded p-3">
            <p className="text-xs text-gray-400">Prize Pool</p>
            <p className="text-lg font-bold text-green-400">₹{challenge.totalPrizePool}</p>
          </div>
          <div className="bg-slate-700/30 rounded p-3">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Users size={14} /> Participants
            </p>
            <p className="text-lg font-bold text-purple-400">
              {challenge.currentParticipants}/{challenge.maxParticipants}
            </p>
          </div>
          <div className="bg-slate-700/30 rounded p-3">
            <p className="text-xs text-gray-400">Category</p>
            <p className="text-lg font-bold text-cyan-400 capitalize">{challenge.category}</p>
          </div>
        </div>

        <Button
          onClick={onJoin}
          disabled={isDisabled}
          className={`w-full ${
            !isDisabled
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              : 'bg-slate-700 cursor-not-allowed opacity-50'
          } text-white font-semibold flex items-center justify-center gap-2`}
        >
          {isLoading ? (
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
}
