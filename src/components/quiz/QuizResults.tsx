'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { LeaderboardEntry, QuizResult } from '@/types/quiz';

interface QuizLeaderboardProps {
  entries: LeaderboardEntry[];
}

interface QuizResultCardProps {
  result: QuizResult;
}

export function QuizLeaderboard({ entries }: QuizLeaderboardProps) {
  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 mb-8">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center gap-2">
          <Trophy size={24} />
          Current Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <div className="space-y-2">
            {entries.map((entry, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 bg-slate-700/30 rounded"
              >
                <div>
                  <p className="font-semibold text-green-400">
                    #{idx + 1} {entry.userName}
                  </p>
                  <p className="text-sm text-gray-400">
                    {entry.totalAttempts} attempts • Avg:{' '}
                    {Math.round(entry.avgScore)}
                  </p>
                </div>
                <p className="text-2xl font-bold text-blue-400">
                  {entry.totalScore}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No leaderboard data yet</p>
        )}
      </CardContent>
    </Card>
  );
}

export function QuizResultCard({ result }: QuizResultCardProps) {
  return (
    <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-400/30 mb-8">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <p className="text-gray-300 mb-2">Your Score</p>
            <p className="text-6xl font-black text-green-400">{result.score}</p>
            <p className="text-gray-400 mt-2">
              out of {result?.totalPoints || 0} points
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-300 mb-2">Accuracy</p>
            <p className="text-6xl font-black text-blue-400">
              {result.percentage}%
            </p>
            <p className="text-gray-400 mt-2">
              {result.correctAnswers} out of {result.totalQuestions} correct
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
