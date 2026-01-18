import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type:
    | 'deposit'
    | 'loan'
    | 'repayment'
    | 'withdrawal'
    | 'fd'
    | 'interest_fd'
    | 'interest_loan'
    | 'withdrawal_fd'
    | 'interest_deposit';
  amount: number;
  date: Date;
}

const TransactionSchema: Schema<ITransaction> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'deposit',
      'loan',
      'repayment',
      'withdrawal',
      'fd',
      'interest_fd',
      'withdrawal_fd',
      'interest_loan',
      'interest_deposit',
    ],
    required: true,
  },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', TransactionSchema);
