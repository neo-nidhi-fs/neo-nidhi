import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRDSubscription extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  schemeId: mongoose.Types.ObjectId;
  monthlyAmount: number;
  mandateDay: number; // 1–28, day of month for auto-debit
  startDate: Date;
  nextDebitDate: Date;
  maturityDate: Date;
  installmentsPaid: number;
  totalDebited: number;
  accruedInterest: number;
  status: 'active' | 'completed' | 'missed' | 'closed';
  missedInstallments: number;
  lastDebitDate?: Date | null;
  closedAt?: Date | null;
  closedBy?: string | null; // admin name who closed it
  maturityAmount?: number | null;
  maturityTransferredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const RDSubscriptionSchema: Schema<IRDSubscription> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    schemeId: { type: Schema.Types.ObjectId, ref: 'RDScheme', required: true, index: true },
    monthlyAmount: { type: Number, required: true, min: 1 },
    mandateDay: { type: Number, required: true, min: 1, max: 28 },
    startDate: { type: Date, required: true },
    nextDebitDate: { type: Date, required: true },
    maturityDate: { type: Date, required: true },
    installmentsPaid: { type: Number, default: 0, min: 0 },
    totalDebited: { type: Number, default: 0, min: 0 },
    accruedInterest: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['active', 'completed', 'missed', 'closed'],
      default: 'active',
    },
    missedInstallments: { type: Number, default: 0, min: 0 },
    lastDebitDate: { type: Date, default: null },
    closedAt: { type: Date, default: null },
    closedBy: { type: String, default: null },
    maturityAmount: { type: Number, default: null },
    maturityTransferredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

RDSubscriptionSchema.index({ userId: 1, status: 1 });
RDSubscriptionSchema.index({ status: 1, nextDebitDate: 1 });

export const RDSubscription: Model<IRDSubscription> =
  mongoose.models.RDSubscription ||
  mongoose.model<IRDSubscription>('RDSubscription', RDSubscriptionSchema);
