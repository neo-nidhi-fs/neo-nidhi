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
    | 'challenge_fee'
    | 'challenge_reward'
    | 'interest_deposit';
  amount: number;
  date: Date;
  relatedUserId?: mongoose.Types.ObjectId; // For user-to-user transfers
  relatedUserName?: string; // Display name of the related user in transfer
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
      'challenge_fee',
      'challenge_reward',
      'interest_fd',
      'withdrawal_fd',
      'interest_loan',
      'interest_deposit',
    ],
    required: true,
  },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  relatedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  relatedUserName: { type: String },
});

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', TransactionSchema);
