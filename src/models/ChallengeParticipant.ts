import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChallengeParticipant extends Document {
  challengeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  registrationFee: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  position: number | null;
  reward: number;
  status: 'registered' | 'started' | 'completed';
  answers: {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
  }[];
  joinedAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}

const ChallengeParticipantSchema: Schema<IChallengeParticipant> = new Schema({
  challengeId: {
    type: Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
  },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  registrationFee: { type: Number, required: true },
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  position: { type: Number, default: null },
  reward: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['registered', 'started', 'completed'],
    default: 'registered',
  },
  answers: [
    {
      questionId: String,
      selectedOption: Number,
      isCorrect: Boolean,
    },
  ],
  joinedAt: { type: Date, default: Date.now },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
});

export const ChallengeParticipant: Model<IChallengeParticipant> =
  mongoose.models.ChallengeParticipant ||
  mongoose.model<IChallengeParticipant>(
    'ChallengeParticipant',
    ChallengeParticipantSchema
  );
