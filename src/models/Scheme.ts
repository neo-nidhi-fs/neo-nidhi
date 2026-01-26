import mongoose, { Schema, Model, Document } from 'mongoose';

interface IScheme extends Document {
  name: 'deposit' | 'fd' | 'loan';
  interestRate: number;
  field: string;
  createdAt: Date;
}

const SchemeSchema = new Schema({
  name: { type: String, required: true }, // e.g. Normal Deposit, FD, RD
  interestRate: { type: Number, required: true }, // percentage
  field: { type: String, default: '', required: true }, // additional field if needed
  createdAt: { type: Date, default: Date.now },
});

export const Scheme: Model<IScheme> =
  mongoose.models.Scheme || mongoose.model('Scheme', SchemeSchema);
