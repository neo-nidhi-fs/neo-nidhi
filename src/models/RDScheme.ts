import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRDScheme extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  interestRate: number; // Annual % rate
  tenureMonths: number;
  minMonthlyAmount: number;
  maxMonthlyAmount?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RDSchemeSchema: Schema<IRDScheme> = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    interestRate: { type: Number, required: true, min: 0 },
    tenureMonths: { type: Number, required: true, min: 1 },
    minMonthlyAmount: { type: Number, required: true, min: 1 },
    maxMonthlyAmount: { type: Number, default: null, min: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const RDScheme: Model<IRDScheme> =
  mongoose.models.RDScheme ||
  mongoose.model<IRDScheme>('RDScheme', RDSchemeSchema);
