export interface Question {
  _id: string;
  question: string;
  options: string[];
  keyword?: string;
  subCategory?: string;
  difficulty: string;
  points: number;
  correctAnswer?: number;
}

export interface AnswerDetail {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  correctAnswer: number;
}

export interface QuizResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  totalPoints: number;
  percentage: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalScore: number;
  totalAttempts: number;
  avgScore: number;
}

export interface Wiki {
  title: string;
  thumbnail?: string;
  summary: string;
  url?: string;
}

export type QuizCategory = 'finance' | 'general';
