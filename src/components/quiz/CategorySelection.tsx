'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

export function CategorySelection({
  onSelectFinance,
  onSelectGeneral,
  loading,
}: {
  onSelectFinance: () => void;
  onSelectGeneral: () => void;
  loading: boolean;
}) {
  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Financial Quizzes
            </span>
          </h1>
          <p className="text-gray-200 text-lg">Test your knowledge and win rewards</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-400/30 hover:border-blue-400/50 transition cursor-pointer">
            <CardHeader>
              <CardTitle className="text-blue-400">Finance Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Learn about money, interest rates, budgeting, and financial management
              </p>
              <Button
                onClick={onSelectFinance}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Brain size={18} />
                Start Finance Quiz
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-400/30 hover:border-purple-400/50 transition cursor-pointer">
            <CardHeader>
              <CardTitle className="text-purple-400">General Knowledge</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">Test your general knowledge across various topics</p>
              <Button
                onClick={onSelectGeneral}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <Brain size={18} />
                Start General Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
