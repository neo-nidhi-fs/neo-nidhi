'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Brain, Loader, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type Question = {
  _id: string;
  question: string;
  options: string[];
  difficulty: string;
  points: number;
};

type QuizResult = {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  totalPoints: number;
  percentage: number;
};

type LeaderboardEntry = {
  userId: string;
  userName: string;
  totalScore: number;
  totalAttempts: number;
  avgScore: number;
};

export default function QuizPage() {
  const { data: session } = useSession();
  const [category, setCategory] = useState<'finance' | 'general' | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: string; selectedOption: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  // Leaderboard is shown in results screen

  const fetchQuestions = async (selectedCategory: 'finance' | 'general') => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/quiz?category=${selectedCategory}&count=10`
      );
      const data = await res.json();
      if (data.success) {
        setQuestions(data.data);
        setCategory(selectedCategory);
        setCurrentQuestion(0);
        setAnswers([]);
        setResult(null);
        setSubmitted(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (selectedCategory: 'finance' | 'general') => {
    try {
      const res = await fetch(
        `/api/quiz/leaderboard?category=${selectedCategory}&limit=10`
      );
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleAnswer = (selectedOption: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionId: questions[currentQuestion]._id,
      selectedOption,
    };
    setAnswers(newAnswers);

    // Auto-move to next question
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          category,
          answers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setSubmitted(true);
        if (category) {
          await fetchLeaderboard(category);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">Please log in to take quizzes</p>
      </div>
    );
  }

  if (loading && questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <Loader className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  // Category Selection
  if (!category) {
    return (
      <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-black mb-2">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Financial Quizzes
              </span>
            </h1>
            <p className="text-gray-200 text-lg">
              Test your knowledge and win rewards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card
              className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-400/30 hover:border-blue-400/50 transition cursor-pointer"
              onClick={() => {
                fetchQuestions('finance');
                fetchLeaderboard('finance');
              }}
            >
              <CardHeader>
                <CardTitle className="text-blue-400">Finance Quiz</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Learn about money, interest rates, budgeting, and financial
                  management
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Brain size={18} />
                  Start Finance Quiz
                </Button>
              </CardContent>
            </Card>

            <Card
              className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-400/30 hover:border-purple-400/50 transition cursor-pointer"
              onClick={() => {
                fetchQuestions('general');
                fetchLeaderboard('general');
              }}
            >
              <CardHeader>
                <CardTitle className="text-purple-400">
                  General Knowledge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Test your general knowledge across various topics
                </p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2">
                  <Brain size={18} />
                  Start GK Quiz
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard Preview */}
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Trophy size={24} />
                Top Scorers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-slate-700/30 rounded"
                    >
                      <div>
                        <p className="font-semibold text-green-400">
                          #{idx + 1} {entry.userName}
                        </p>
                        <p className="text-sm text-gray-400">
                          {entry.totalAttempts} attempts
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-blue-400">
                        {entry.totalScore}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No scores yet. Be the first!</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Quiz In Progress
  if (!submitted) {
    return (
      <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <h2 className="text-xl font-semibold">
                Question {currentQuestion + 1} of {questions.length}
              </h2>
              <p className="text-cyan-400">
                {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
              </p>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question */}
          {questions.length > 0 && (
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle className="text-cyan-400">
                  {questions[currentQuestion].question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, idx) => (
                    <Button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full justify-start text-left h-auto py-3 px-4 ${
                        answers[currentQuestion]?.selectedOption === idx
                          ? 'bg-blue-600 border border-blue-400'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      <span className="font-semibold mr-3">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {option}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex gap-4 justify-between">
            <Button
              onClick={() =>
                setCurrentQuestion(Math.max(0, currentQuestion - 1))
              }
              disabled={currentQuestion === 0}
              className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
            >
              ← Previous
            </Button>

            {currentQuestion === questions.length - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={answers.length < questions.length || loading}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Quiz
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() =>
                  setCurrentQuestion(
                    Math.min(questions.length - 1, currentQuestion + 1)
                  )
                }
                className="bg-slate-700 hover:bg-slate-600 flex items-center gap-2"
              >
                Next →
              </Button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Results
  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Quiz Complete!
            </span>
          </h1>
          <p className="text-gray-200 text-lg">Here&apos;s how you performed</p>
        </div>

        {result && (
          <>
            {/* Score Card */}
            <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-400/30 mb-8">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="text-gray-300 mb-2">Your Score</p>
                    <p className="text-6xl font-black text-green-400">
                      {result.score}
                    </p>
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
                      {result.correctAnswers} out of {result.totalQuestions}{' '}
                      correct
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 mb-8">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Trophy size={24} />
                  Current Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {leaderboard.map((entry, idx) => (
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
          </>
        )}

        {/* Actions */}
        <div className="flex gap-4 flex-wrap justify-center">
          <Button
            onClick={() => {
              setCategory(null);
              setCurrentQuestion(0);
              setAnswers([]);
              setResult(null);
              setSubmitted(false);
            }}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Brain size={18} />
            Take Another Quiz
          </Button>

          <Link href="/user/challenges">
            <Button className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2">
              <Trophy size={18} />
              Join Challenges
            </Button>
          </Link>

          <Link href="/user/dashboard">
            <Button className="bg-slate-700 hover:bg-slate-600 flex items-center gap-2">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
