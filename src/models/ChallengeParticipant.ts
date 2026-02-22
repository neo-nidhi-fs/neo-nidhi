import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChallengeParticipant extends Document {
  challengeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  registrationFee: number;
  score: number;
  position: number | null;
  reward: number;
  joinedAt: Date;
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
  position: { type: Number, default: null },
  reward: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
});

export const ChallengeParticipant: Model<IChallengeParticipant> =
  mongoose.models.ChallengeParticipant ||
  mongoose.model<IChallengeParticipant>(
    'ChallengeParticipant',
    ChallengeParticipantSchema
  );
