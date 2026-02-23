import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChallenge extends Document {
  title: string;
  description: string;
  category: 'finance' | 'general';
  questionCount: number;
  registrationFee: number;
  maxParticipants: number;
  currentParticipants: number;
  status: 'registration' | 'started' | 'completed' | 'cancelled';
  createdBy: mongoose.Types.ObjectId;
  startDate: Date | null;
  endDate: Date | null;
  durationMinutes: number;
  participants: mongoose.Types.ObjectId[];
  winners: {
    position: 1 | 2 | 3;
    userId: mongoose.Types.ObjectId;
    score: number;
    reward: number;
  }[];
  totalPrizePool: number;
  prizeDistribution: {
    first: number;
    second: number;
    third: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSchema: Schema<IChallenge> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['finance', 'general'],
      default: 'finance',
    },
    questionCount: { type: Number, required: true, default: 10 },
    registrationFee: { type: Number, required: true },
    maxParticipants: { type: Number, required: true },
    currentParticipants: { type: Number, default: 0 },
    status: {
      type: String,
      enum: {
        values: ['registration', 'started', 'completed', 'cancelled'],
        message:
          'Status must be one of: registration, started, completed, cancelled',
      },
      default: 'registration',
      required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    durationMinutes: { type: Number, default: 30 },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    winners: [
      {
        position: { type: Number, enum: [1, 2, 3] },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        score: Number,
        reward: Number,
      },
    ],
    totalPrizePool: { type: Number, default: 0 },
    prizeDistribution: {
      first: { type: Number, default: 0.5 },
      second: { type: Number, default: 0.3 },
      third: { type: Number, default: 0.2 },
    },
  },
  { timestamps: true }
);

export const Challenge: Model<IChallenge> =
  mongoose.models.Challenge ||
  mongoose.model<IChallenge>('Challenge', ChallengeSchema);
