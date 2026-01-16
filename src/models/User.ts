import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  name: string;
  age: number;
  role: "admin" | "user";
  savingsBalance: number;
  fd: number;
  loanBalance: number;
  transactions: mongoose.Types.ObjectId[];
  password: string;
  createdAt: Date;
  lastInterestCalc: Date | null;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  savingsBalance: { type: Number, default: 0 },
  fd: { type: Number, default: 0 },
  loanBalance: { type: Number, default: 0 },
  transactions: [{ type: Schema.Types.ObjectId, ref: "Transaction" }],
  lastInterestCalc: { type: Date, default: null }, 
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);