import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
  savingsInterestRate: number;
  loanInterestRate: number;
}

const SettingsSchema: Schema<ISettings> = new Schema({
  savingsInterestRate: { type: Number, required: true },
  loanInterestRate: { type: Number, required: true },
});

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);