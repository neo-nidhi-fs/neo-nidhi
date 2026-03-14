import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface ICustomInterestRate {
  saving?: number;
  fd?: number;
  loan?: number;
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
