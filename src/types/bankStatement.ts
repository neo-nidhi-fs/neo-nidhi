export interface ParsedTransaction {
  tempId: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  paymentSource: 'account';
  source: string;
}
