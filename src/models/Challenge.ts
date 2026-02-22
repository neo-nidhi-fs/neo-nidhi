import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChallenge extends Document {
  title: string;
  description: string;
  category: 'finance' | 'general';
  registrationFee: number;
  maxParticipants: number;
  currentParticipants: number;
  status: 'active' | 'completed' | 'cancelled';
  createdBy: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  participants: mongoose.Types.ObjectId[];
  winners: {
    position: 1 | 2 | 3;
    userId: mongoose.Types.ObjectId;
    score: number;
    reward: number;
  }[];
  totalPrizePool: number;
  createdAt: Date;
}

const ChallengeSchema: Schema<IChallenge> = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['finance', 'general'], default: 'finance' },
  registrationFee: { type: Number, required: true },
  maxParticipants: { type: Number, required: true },
  currentParticipants: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
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
  createdAt: { type: Date, default: Date.now },
});

export const Challenge: Model<IChallenge> =
  mongoose.models.Challenge ||
  mongoose.model<IChallenge>('Challenge', ChallengeSchema);
