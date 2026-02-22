import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuizResult extends Document {
  userId: mongoose.Types.ObjectId;
  category: 'finance' | 'general';
  score: number;
  totalPoints: number;
  correctAnswers: number;
  totalQuestions: number;
  answers: {
    questionId: mongoose.Types.ObjectId;
    selectedOption: number;
    isCorrect: boolean;
    points: number;
  }[];
  completedAt: Date;
}

const QuizResultSchema: Schema<IQuizResult> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['finance', 'general'], required: true },
  score: { type: Number, required: true },
  totalPoints: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  answers: [
    {
      questionId: { type: Schema.Types.ObjectId, ref: 'QuizQuestion' },
      selectedOption: Number,
      isCorrect: Boolean,
      points: Number,
    },
  ],
  completedAt: { type: Date, default: Date.now },
});

export const QuizResult: Model<IQuizResult> =
  mongoose.models.QuizResult ||
  mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);
