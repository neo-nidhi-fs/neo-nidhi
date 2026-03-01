'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader, Brain, Trophy, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import Image from 'next/image';
import Link from 'next/link';
import {
  Question,
  AnswerDetail,
  QuizResult,
  LeaderboardEntry,
  Wiki,
  QuizCategory,
} from '@/types/quiz';
import { QUIZ_ENDPOINTS, QUIZ_CONFIG, QUIZ_MESSAGES } from '@/constants/quiz';
import { extractKeywordPhrase } from '@/lib/helpers';


export default function QuizPage() {
  const { data: session } = useSession();
  const [category, setCategory] = useState<QuizCategory | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: string; selectedOption: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [answerDetails, setAnswerDetails] = useState<AnswerDetail[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [reviewQuestions, setReviewQuestions] = useState<
    Array<Question & { correctAnswer: number }>
  >([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [wikipediaSummary, setWikipediaSummary] = useState<Wiki | null>(null);

  const fetchQuestions = async (selectedCategory: QuizCategory) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${QUIZ_ENDPOINTS.FETCH_QUESTIONS}?category=${selectedCategory}&subCategory=${selectedSubCategory}&count=${QUIZ_CONFIG.QUESTIONS_PER_QUIZ}&userId=${session?.user?.id || ''}`
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

  const fetchWikipediaSummary = async (query: string) => {
    try {
      const keyword = extractKeywordPhrase(query).replace(' ', '_');
      const res = await fetch(`${QUIZ_ENDPOINTS.FETCH_WIKI}?query=${keyword}`);
      const data = await res.json();
      if (data) {
        setWikipediaSummary(data);
      }
    } catch (error) {
      console.error('Error fetching Wikipedia summary:', error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const res = await fetch(QUIZ_ENDPOINTS.FETCH_SUBCATEGORIES);
      const data = await res.json();
      if (data.success) {
        setSubCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchLeaderboard = async (selectedCategory: QuizCategory) => {
    try {
      const res = await fetch(
        `${QUIZ_ENDPOINTS.FETCH_LEADERBOARD}?category=${selectedCategory}&limit=${QUIZ_CONFIG.LEADERBOARD_LIMIT}`
      );
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  useEffect(() => {
    fetchLeaderboard('general');
    fetchSubCategories();
  }, []);

  const handleAnswer = (selectedOption: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionId: questions[currentQuestion]._id,
      selectedOption,
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), QUIZ_CONFIG.AUTO_MOVE_DELAY);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const res = await fetch(QUIZ_ENDPOINTS.SUBMIT_QUIZ, {
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

        const questionIds = answers.map((a) => a.questionId).join(',');
        const reviewQuestionsRes = await fetch(
          `${QUIZ_ENDPOINTS.FETCH_QUESTIONS}?category=${category}&questionIds=${questionIds}&review=true`
        );
        const reviewData = await reviewQuestionsRes.json();
        const fetchedReviewQuestions = reviewData.success ? reviewData.data : [];
        setReviewQuestions(fetchedReviewQuestions);

        const details: AnswerDetail[] = answers.map((answer, idx) => {
          const correctAnswer = fetchedReviewQuestions[idx]?.correctAnswer || 0;
          return {
            questionId: answer.questionId,
            selectedOption: answer.selectedOption,
            isCorrect: answer.selectedOption === correctAnswer,
            correctAnswer,
          };
        });
        setAnswerDetails(details);

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
        <p className="text-gray-100">{QUIZ_MESSAGES.NOT_LOGGED_IN}</p>
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
                  Learn about money, interest rates, budgeting, and financial management
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Brain size={18} />
                  Start Finance Quiz
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-400/30 hover:border-purple-400/50 transition cursor-pointer">
              <CardHeader>
                <CardTitle className="text-purple-400">
                  General Knowledge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Test your general knowledge across various topics
                </p>
                <div className="flex justify-center items-center mb-4">
                  <Select
                    value={selectedSubCategory}
                    onValueChange={(value) => setSelectedSubCategory(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a subCategory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {subCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => {
                    fetchQuestions('general');
                  }}
                  className="w-full pt-2 bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
                >
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
                  {leaderboard.slice(0, QUIZ_CONFIG.LEADERBOARD_PREVIEW_LIMIT).map((entry, idx) => (
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
                <p className="text-gray-400">{QUIZ_MESSAGES.NO_SCORES}</p>
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
                      className={`w-full justify-start text-left h-auto py-3 flex-wrap px-4 ${
                        answers[currentQuestion]?.selectedOption === idx
                          ? 'bg-blue-600 border border-blue-400'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      <span className="font-semibold mr-3 text-wrap">
                        {String.fromCharCode(65 + idx)}.{option}
                      </span>
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
                  <p className="text-gray-400">{QUIZ_MESSAGES.NO_LEADERBOARD}</p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Answer Review Section */}
        {reviewQuestions.length > 0 && answerDetails.length > 0 && (
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-cyan-400">
                Review Your Answers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reviewQuestions.map((question, idx) => {
                  const answer = answerDetails[idx];
                  const isCorrect = answer?.isCorrect || false;
                  const selectedOption = answer?.selectedOption;
                  const correctOption = question.correctAnswer;

                  return (
                    <div
                      key={question._id}
                      className="border-b border-slate-700 pb-6 last:border-b-0"
                    >
                      <div className="mb-4">
                        <p className="text-sm text-cyan-400 font-semibold">
                          Question {idx + 1}
                        </p>
                        <p className="text-gray-100 text-lg mt-2">
                          {question.question}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {question.options.map((option, optIdx) => {
                          let bgColor = 'bg-slate-700/30 border-slate-600';
                          let textColor = 'text-gray-300';

                          if (selectedOption === optIdx) {
                            if (isCorrect) {
                              bgColor = 'bg-green-700/30 border-green-400';
                              textColor = 'text-green-300 font-semibold';
                            } else {
                              bgColor = 'bg-red-700/30 border-red-400';
                              textColor = 'text-red-300 font-semibold';
                            }
                          } else if (optIdx === correctOption && !isCorrect) {
                            bgColor = 'bg-blue-700/30 border-blue-400';
                            textColor = 'text-blue-300 font-semibold';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-lg border-2 ${bgColor} ${textColor}`}
                            >
                              <p className="text-sm">
                                {String.fromCharCode(65 + optIdx)}. {option}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-400/30 rounded-lg">
                        <p className="text-sm text-blue-300">
                          <span className="font-semibold">
                            {!isCorrect && 'Correct'} Answer:
                          </span>{' '}
                          {question.options[question.correctAnswer || 0]}
                          <Drawer direction="bottom">
                            <DrawerTrigger asChild>
                              <Info
                                className="inline-block ml-2 text-blue-400 cursor-pointer"
                                size={16}
                                onClick={async () =>
                                  fetchWikipediaSummary(
                                    question?.keyword || 'information'
                                  )
                                }
                              />
                            </DrawerTrigger>
                            <DrawerContent className="bg-gradient-to-b from-slate-800 to-slate-900">
                              <DrawerHeader className="border-b border-slate-700">
                                <DrawerTitle className="text-cyan-400 text-xl">
                                  {question.question}
                                </DrawerTitle>
                              </DrawerHeader>
                              <div className="p-6 overflow-y-auto max-h-[70vh]">
                                {wikipediaSummary ? (
                                  <div className="space-y-4">
                                    {wikipediaSummary.thumbnail && (
                                      <div className="flex justify-center">
                                        <Image
                                          src={
                                            wikipediaSummary?.thumbnail ||
                                            '/placeholder.png'
                                          }
                                          alt={wikipediaSummary?.title}
                                          width={300}
                                          height={200}
                                          className="rounded-lg shadow-lg border border-slate-600"
                                        />
                                      </div>
                                    )}
                                    <div>
                                      <h3 className="text-lg font-semibold text-white mb-3">
                                        {wikipediaSummary.title}
                                      </h3>
                                      <p className="text-gray-300 leading-relaxed text-justify">
                                        {wikipediaSummary.summary}
                                      </p>
                                    </div>
                                    {wikipediaSummary.url && (
                                      <Button
                                        asChild
                                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                                      >
                                        <a
                                          href={wikipediaSummary.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          Read Full Article on Wikipedia
                                        </a>
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <Loader className="w-10 h-10 text-cyan-400 animate-spin" />
                                    <p className="text-gray-400 text-center">
                                      {QUIZ_MESSAGES.LOADING_INFO}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </DrawerContent>
                          </Drawer>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
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
              setAnswerDetails([]);
              setReviewQuestions([]);
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
