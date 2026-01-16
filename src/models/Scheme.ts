import mongoose, { Schema, Model, Document } from 'mongoose';

interface IScheme extends Document {
  name: string;
  interestRate: number;
  createdAt: Date;
}

const SchemeSchema = new Schema({
  name: { type: String, required: true }, // e.g. Normal Deposit, FD, RD
  interestRate: { type: Number, required: true }, // percentage
  createdAt: { type: Date, default: Date.now },
});

export const Scheme: Model<IScheme> =
  mongoose.models.Scheme || mongoose.model('Scheme', SchemeSchema);
