'use client';

import { useState, useCallback } from 'react';
import { Question, AnswerDetail, QuizResult } from '@/types/quiz';

export function useQuizState() {
  const [category, setCategory] = useState<'finance' | 'general' | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedOption: number }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [answerDetails, setAnswerDetails] = useState<AnswerDetail[]>([]);

  const handleAnswer = useCallback(
    (selectedOption: number) => {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = {
        questionId: questions[currentQuestion]._id,
        selectedOption,
      };
      setAnswers(newAnswers);

      if (currentQuestion < questions.length - 1) {
        setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
      }
    },
    [answers, currentQuestion, questions]
  );

  return {
    category,
    setCategory,
    questions,
    setQuestions,
    currentQuestion,
    setCurrentQuestion,
    answers,
    setAnswers,
    submitted,
    setSubmitted,
    result,
    setResult,
    answerDetails,
    setAnswerDetails,
    handleAnswer,
  };
}
