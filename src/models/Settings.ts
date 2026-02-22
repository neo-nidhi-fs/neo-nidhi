import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  savingsInterestRate: number;
  loanInterestRate: number;
  fdInterestRate: number;
  fdPrematureInterestRate: number;
}

const SettingsSchema: Schema<ISettings> = new Schema({
  savingsInterestRate: { type: Number, required: true },
  loanInterestRate: { type: Number, required: true },
  fdInterestRate: { type: Number, required: true, default: 6 },
  fdPrematureInterestRate: { type: Number, required: true, default: 3.5 },
});

export const Settings: Model<ISettings> =
  mongoose.models.Settings ||
  mongoose.model<ISettings>('Settings', SettingsSchema);
