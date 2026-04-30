export type ParsedFinanceSms = {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
  source: string;
  paymentSource: 'account' | 'cash' | 'card' | 'wallet';
};

const DEBIT_KEYWORDS = [
  'debited',
  'spent',
  'purchase',
  'withdrawn',
  'sent',
  'paid',
  'dr',
];

const CREDIT_KEYWORDS = [
  'credited',
  'received',
  'deposit',
  'refund',
  'cashback',
  'cr',
];

function parseAmount(text: string): number | null {
  const match = text.match(/(?:rs\.?|inr|\u20B9)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i);
  if (!match) return null;
  const normalized = match[1].replace(/,/g, '');
  const amount = Number.parseFloat(normalized);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

function detectType(text: string): 'income' | 'expense' | null {
  const lower = text.toLowerCase();
  if (CREDIT_KEYWORDS.some((word) => lower.includes(word))) return 'income';
  if (DEBIT_KEYWORDS.some((word) => lower.includes(word))) return 'expense';
  return null;
}

function detectCategory(text: string, type: 'income' | 'expense'): string {
  const lower = text.toLowerCase();

  if (lower.includes('groww invest tech pvt ltd')) return 'Investment';
  if (lower.includes('abhirami v m')) return 'Gift';

  if (lower.includes('upi')) return type === 'income' ? 'UPI Credit' : 'UPI Payment';
  if (lower.includes('atm')) return 'ATM';
  if (lower.includes('imps')) return type === 'income' ? 'IMPS Credit' : 'IMPS Transfer';
  if (lower.includes('neft')) return type === 'income' ? 'NEFT Credit' : 'NEFT Transfer';
  if (lower.includes('salary')) return 'Salary';
  if (lower.includes('interest')) return 'Interest';
  if (lower.includes('refund')) return 'Refund';
  if (lower.includes('cashback')) return 'Cashback';
  if (lower.includes('card')) return type === 'income' ? 'Card Credit' : 'Card Payment';

  return type === 'income' ? 'Other Income' : 'Other Expense';
}

function detectPaymentSource(text: string): 'account' | 'cash' | 'card' | 'wallet' {
  const lower = text.toLowerCase();
  if (lower.includes('wallet')) return 'wallet';
  if (lower.includes('card') || lower.includes('credit card') || lower.includes('debit card')) {
    return 'card';
  }
  if (lower.includes('cash')) return 'cash';
  return 'account';
}

export function parseFinanceSms(messageBody: string, sender?: string): ParsedFinanceSms | null {
  const normalized = String(messageBody || '').trim();
  if (!normalized) return null;
  const senderText = String(sender || '').trim();
  const combinedText = `${senderText} ${normalized}`.trim();

  const amount = parseAmount(combinedText);
  if (!amount) return null;

  const type = detectType(combinedText);
  if (!type) return null;

  const category = detectCategory(combinedText, type);
  const paymentSource = detectPaymentSource(combinedText);

  return {
    type,
    amount,
    category,
    note: normalized.slice(0, 500),
    source: 'sms_auto',
    paymentSource,
  };
}
