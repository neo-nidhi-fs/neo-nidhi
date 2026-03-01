export interface Challenge {
  _id: string;
  title: string;
  description: string;
  totalPrizePool: number;
  endDate?: string | null;
  startDate?: string;
  status?: 'active' | 'completed' | 'upcoming';
  participants?: number;
  questionCount?: number;
}

export interface ChallengeQuestion {
  _id: string;
  question: string;
  options: string[];
  difficulty: string;
  points: number;
  correctAnswer?: number;
}

export interface ChallengeResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  totalPoints: number;
  percentage: number;
  rank?: number;
}

export interface ChallengeparticipantAnswer {
  questionId: string;
  selectedOption: number;
}

export interface ScannedUser {
  userId: string;
  userName: string;
}

export interface TransferRequest {
  fromUserId: string;
  toUserName: string;
  amount: number;
  mpin: string;
  description?: string;
}

export interface TransactionRecord {
  _id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'interest' | 'loan';
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description?: string;
}

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  savingsBalance?: number;
  fd?: number;
  fdBalance?: number;
  loanBalance?: number;
  phoneNumber?: string;
  mpin?: string;
}

export interface Metric {
  label: string;
  value: string | number;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  icon: React.ComponentType<{ size?: number }>;
}
