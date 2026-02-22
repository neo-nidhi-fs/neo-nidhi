import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuizQuestion extends Document {
  category: 'finance' | 'general';
  question: string;
  options: string[];
  correctAnswer: number; // 0-3 index of correct option
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  createdAt: Date;
}

const QuizQuestionSchema: Schema<IQuizQuestion> = new Schema({
  category: { type: String, enum: ['finance', 'general'], required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true, min: 0, max: 3 },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  points: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now },
});

export const QuizQuestion: Model<IQuizQuestion> =
  mongoose.models.QuizQuestion ||
  mongoose.model<IQuizQuestion>('QuizQuestion', QuizQuestionSchema);
