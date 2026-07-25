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
  allowAutoDebit: boolean; // SIP / recurring debit enabled
  allowOneTimeInvestment: boolean; // Lump-sum one-time investment enabled
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
    allowAutoDebit: { type: Boolean, default: true },
    allowOneTimeInvestment: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const RDScheme: Model<IRDScheme> =
  mongoose.models.RDScheme ||
  mongoose.model<IRDScheme>('RDScheme', RDSchemeSchema);
