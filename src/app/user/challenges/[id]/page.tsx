'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Loader, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

type Question = {
  _id: string;
  question: string;
  options: string[];
  difficulty: string;
  points: number;
};

type Challenge = {
  _id: string;
  title: string;
  description: string;
  category: 'finance' | 'general';
  questionCount: number;
  totalPrizePool: number;
  registrationFee: number;
  startDate?: Date | null;
  endDate?: Date | null;
  durationMinutes?: number;
};

type ChallengeResult = {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  totalPoints: number;
  percentage: number;
};

export default function ChallengePage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const challengeId = params.id as string;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: string; selectedOption: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchChallenge = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/challenges/${challengeId}`);
        const data = await res.json();
        if (data.success) {
          setChallenge(data.challenge);
          setQuestions(data.questions);

          // Calculate time remaining if challenge has endDate
          if (data.challenge.endDate) {
            const endTime = new Date(data.challenge.endDate).getTime();
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
            setTimeRemaining(remaining);
          }
        } else {
          alert('Challenge not found');
          router.push('/user/challenges');
        }
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchChallenge();
    }
  }, [session?.user?.id, challengeId, router]);

  // Timer countdown effect
  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0 || submitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          setTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, submitted]);

  const handleAnswer = (selectedOption: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionId: questions[currentQuestion]._id,
      selectedOption,
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    }
  };

  const handleSubmitChallenge = useCallback(async () => {
    if (!session?.user?.id || !challenge) return;

    setLoading(true);
    try {
      const res = await fetch('/api/challenges/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          challengeId,
          answers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setSubmitted(true);
      } else {
        alert(`Error: ${data.error}`);
      }
    } finally {
      setLoading(false);
    }
  }, [session, challenge, challengeId, answers]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timedOut && !submitted) {
      handleSubmitChallenge();
    }
  }, [timedOut, submitted, handleSubmitChallenge]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">Please log in to take challenges</p>
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

  if (!challenge || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">Challenge not found</p>
      </div>
    );
  }

  // Challenge In Progress
  if (!submitted) {
    return (
      <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <h2 className="text-xl font-semibold">{challenge.title}</h2>
              <div className="flex items-center gap-4">
                <p className="text-cyan-400">
                  Q{currentQuestion + 1}/{questions.length}
                </p>
                {mounted && timeRemaining !== null && (
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                      timeRemaining <= 60
                        ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                        : 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                    }`}
                  >
                    <Clock size={16} />
                    <span className="font-semibold">
                      {Math.floor(timeRemaining / 60)}:
                      {String(timeRemaining % 60).padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>
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
              <CardContent className="pt-6">
                <p className="text-lg font-semibold mb-6">
                  {questions[currentQuestion].question}
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {questions[currentQuestion].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`p-4 rounded-lg border-2 transition text-left ${
                        answers[currentQuestion]?.selectedOption === idx
                          ? 'bg-blue-600/30 border-blue-400 text-blue-300'
                          : 'bg-slate-700/30 border-slate-600 text-gray-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="font-semibold">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {' ' + option}
                    </button>
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
                onClick={handleSubmitChallenge}
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
                    Submit Challenge
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

  // Challenge Results
  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Challenge Complete!
            </span>
          </h1>
          <p className="text-gray-200 text-lg">{challenge.title}</p>
        </div>

        {result && (
          <>
            {/* Score Card */}
            <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-400/30 mb-8">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-gray-300 mb-2">Your Score</p>
                    <p className="text-6xl font-black text-green-400">
                      {result.score}
                    </p>
                    <p className="text-gray-400 mt-2">
                      out of {result.totalPoints} points
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-300 mb-2">Accuracy</p>
                    <p className="text-6xl font-black text-blue-400">
                      {result.percentage}%
                    </p>
                    <p className="text-gray-400 mt-2">
                      {result.correctAnswers} out of {result.totalQuestions}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-300 mb-2">Prize Pool</p>
                    <p className="text-6xl font-black text-purple-400">
                      ₹{challenge.totalPrizePool}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-gray-400 mb-8">
              Your ranking will be calculated once all participants complete the
              challenge. Check back in your dashboard for prize distribution!
            </p>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/user/challenges">
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Trophy size={18} />
              Back to Challenges
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
