import mongoose, { Schema, Model, Document } from 'mongoose';

interface IScheme extends Document {
  name: 'deposit' | 'fd' | 'loan' | 'rd';
  interestRate: number;
  amount?: number | null;
  tenureMonths?: number | null;
  createdAt: Date;
}

const SchemeSchema = new Schema({
  name: { type: String, required: true }, // e.g. Normal Deposit, FD, RD
  interestRate: { type: Number, required: true }, // percentage
  amount: { type: Number, default: null, min: 0 },
  tenureMonths: { type: Number, default: null, min: 1 },
  createdAt: { type: Date, default: Date.now },
});

export const Scheme: Model<IScheme> =
  mongoose.models.Scheme || mongoose.model('Scheme', SchemeSchema);
