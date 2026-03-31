import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICashFlow extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  date: Date;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  source: string;
  note?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const CashFlowSchema: Schema<ICashFlow> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    source: { type: String, required: true },
    note: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

export const CashFlow: Model<ICashFlow> =
  mongoose.models.CashFlow || mongoose.model<ICashFlow>('CashFlow', CashFlowSchema);
