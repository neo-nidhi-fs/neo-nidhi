import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBudget extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  month: string; // YYYY-MM
  category: string;
  amount: number;
  note?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema: Schema<IBudget> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    note: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

BudgetSchema.index({ user: 1, month: 1, category: 1 }, { unique: true });

export const Budget: Model<IBudget> =
  mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);
