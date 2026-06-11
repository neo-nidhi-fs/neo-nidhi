import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICashFlow extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  date: Date;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  source: string;
  liabilityId?: mongoose.Types.ObjectId | null;
  /**
   * Optional source mode; older docs may have missing value or `credit_card`.
   * New values should use `card` instead of `credit_card`.
   */
  paymentSource?: 'account' | 'cash' | 'card' | 'wallet' | 'credit_card';
  note?: string | null;
  /**
   * Stable fingerprint for SMS-ingested entries.
   * Used to dedupe even if note/category/amount are edited later.
   */
  smsFingerprint?: string | null;
  /**
   * Device-side SMS timestamp (epoch ms) captured from client payload.
   */
  smsDeviceTimeMs?: number | null;
  /**
   * Extracted reference tokens (UTR/RRN/Txn/Ref IDs) for additional dedupe checks.
   */
  smsReferenceKeys?: string[] | null;
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
    liabilityId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    paymentSource: {
      type: String,
      enum: ['account', 'cash', 'card', 'wallet', 'credit_card'],
      required: false,
    },
    note: { type: String, default: null },
    smsFingerprint: { type: String, default: null },
    smsDeviceTimeMs: { type: Number, default: null },
    smsReferenceKeys: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

CashFlowSchema.index(
  { user: 1, smsFingerprint: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { smsFingerprint: { $type: 'string' } },
  }
);

CashFlowSchema.index({ user: 1, date: -1 });
CashFlowSchema.index({ user: 1, type: 1, date: -1 });

export const CashFlow: Model<ICashFlow> =
  mongoose.models.CashFlow ||
  mongoose.model<ICashFlow>('CashFlow', CashFlowSchema);
