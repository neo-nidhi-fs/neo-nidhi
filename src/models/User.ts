import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface ICustomInterestRate {
  saving?: number;
  fd?: number;
  loan?: number;
}

export interface IUserFeatures {
  financeFeaturesEnabled: boolean;
  androidAppEnabled: boolean;
  onlineTransferEnabled: boolean;
  quizzesEnabled: boolean;
  challengesEnabled: boolean;
}

export interface IAsset extends Document {
  _id: mongoose.Types.ObjectId;
  type:
    | 'fd'
    | 'rd'
    | 'equity'
    | 'mutual_fund'
    | 'epfo'
    | 'etf'
    | 'gold'
    | 'silver'
    | 'other';
  category: string;
  amount: number;
  quantity?: number;
  purchaseValue?: number;
  marketValue: number;
  symbolOrCode?: string;
  startDate?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILiability extends Document {
  _id: mongoose.Types.ObjectId;
  type: string;
  amount: number;
  note?: string;
  interestRate?: number;
  startDate?: Date;
  dueDate?: Date;
  status: 'active' | 'paid_off' | 'closed';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  name: string;
  age: number;
  dob?: Date;
  role: 'admin' | 'user';
  savingsBalance: number;
  fd: number;
  loanBalance: number;
  transactions: mongoose.Types.ObjectId[];
  password: string;
  createdAt: Date;
  accruedSavingInterest: number;
  accruedFdInterest: number;
  accruedLoanInterest: number;
  lastInterestCalc: Date | null;
  customInterestRates: ICustomInterestRate;
  mpin?: string;
  qrCode?: string;
  features: IUserFeatures;
  // Legacy field for backward compatibility with existing data
  financeFeaturesEnabled?: boolean;
  assetPortfolio: IAsset[];
  liabilities: ILiability[];
  comparePassword(candidatePassword: string): Promise<boolean>;
  compareMPin(candidateMPin: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  dob: { type: Date, default: null },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  savingsBalance: { type: Number, default: 0 },
  fd: { type: Number, default: 0 },
  loanBalance: { type: Number, default: 0 },
  transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
  lastInterestCalc: { type: Date, default: null },
  password: { type: String, required: true },
  accruedSavingInterest: { type: Number, default: 0 },
  accruedFdInterest: { type: Number, default: 0 },
  accruedLoanInterest: { type: Number, default: 0 },
  customInterestRates: {
    type: {
      saving: { type: Number, default: null },
      fd: { type: Number, default: null },
      loan: { type: Number, default: null },
    },
    default: {},
  },
  createdAt: { type: Date, default: Date.now },
  mpin: { type: String, default: null },
  qrCode: { type: String, default: null },
  features: {
    type: {
      financeFeaturesEnabled: { type: Boolean, default: false },
      androidAppEnabled: { type: Boolean, default: false },
      onlineTransferEnabled: { type: Boolean, default: false },
      quizzesEnabled: { type: Boolean, default: false },
      challengesEnabled: { type: Boolean, default: false },
    },
    default: {},
  },
  // Legacy root-level flag kept for backward compatibility and migration only.
  financeFeaturesEnabled: { type: Boolean, default: undefined },
  assetPortfolio: [
    {
      type: {
        type: String,
        enum: [
          'fd',
          'rd',
          'equity',
          'mutual_fund',
          'epfo',
          'etf',
          'gold',
          'silver',
          'other',
        ],
        required: true,
      },
      category: { type: String, required: true },
      amount: { type: Number, required: true },
      quantity: { type: Number, default: null },
      purchaseValue: { type: Number, default: null },
      marketValue: { type: Number, required: true },
      symbolOrCode: { type: String, default: null },
      startDate: { type: Date, default: null },
      metadata: { type: Schema.Types.Mixed, default: {} },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
  liabilities: [
    {
      type: { type: String, required: true },
      amount: { type: Number, required: true },
      interestRate: { type: Number, default: null },
      startDate: { type: Date, default: null },
      dueDate: { type: Date, default: null },
      note: { type: String, default: '' },
      status: {
        type: String,
        enum: ['active', 'paid_off', 'closed'],
        default: 'active',
      },
      metadata: { type: Schema.Types.Mixed, default: {} },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
});

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password') && !this.isModified('mpin')) return;

  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Hash MPIN if modified
  if (this.isModified('mpin') && this.mpin) {
    const salt = await bcrypt.genSalt(10);
    this.mpin = await bcrypt.hash(this.mpin, salt);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Compare MPIN method
UserSchema.methods.compareMPin = async function (candidateMPin: string) {
  return bcrypt.compare(candidateMPin, this.mpin);
};

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
