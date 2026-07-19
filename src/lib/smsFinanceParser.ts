/**
 * Enum for transaction types.
 */
export enum FinanceTransactionType {
  Income = 'income',
  Expense = 'expense',
}

/**
 * Enum for payment sources.
 */
export enum PaymentSource {
  Account = 'account',
  Cash = 'cash',
  Card = 'card',
  Wallet = 'wallet',
}

/**
 * Parsed finance SMS structure.
 */
export interface ParsedFinanceSms {
  type: FinanceTransactionType;
  amount: number;
  category: string;
  note: string;
  source: string;
  paymentSource: PaymentSource;
}

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

/**
 * Extracts the amount from the SMS text.
 */
function parseAmount(text: string): number | null {
  const match = text.match(
    /(?:rs\.?|inr|\u20B9)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i
  );
  if (!match) return null;
  const normalized = match[1].replace(/,/g, '');
  const amount = Number.parseFloat(normalized);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

/**
 * Detects transaction type from SMS text.
 */
function containsWholeWord(text: string, keyword: string): boolean {
  return new RegExp(`\\b${escapeForRegex(keyword)}\\b`, 'i').test(text);
}

function detectType(text: string): FinanceTransactionType | null {
  const lower = text.toLowerCase();
  if (containsWholeWord(lower, 'debited'))
    return FinanceTransactionType.Expense;
  if (containsWholeWord(lower, 'credited'))
    return FinanceTransactionType.Income;
  if (containsWholeWord(lower, 'top up')) return FinanceTransactionType.Expense;
  if (CREDIT_KEYWORDS.some((word) => containsWholeWord(lower, word)))
    return FinanceTransactionType.Income;
  if (DEBIT_KEYWORDS.some((word) => containsWholeWord(lower, word)))
    return FinanceTransactionType.Expense;
  return null;
}

function isGrowwInvestmentText(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes('groww') && lower.includes('invest');
}

function escapeForRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractSourceName(text: string): string | null {
  const normalized = text.replace(/\r/g, '');
  const lines = normalized.split('\n').map((line) => line.trim());

  for (const line of lines) {
    const match = line.match(/\b(?:at|to)\s+(.+)/i);
    if (!match?.[1]) continue;

    let source = match[1].trim().replace(/[.,;:]+$/g, '');
    source = source.replace(/\s+on\s+.*$/i, '').trim();
    if (!source || /^(?:a\/c|account|your|from)\b/i.test(source)) continue;
    return source;
  }

  const fallbackMatch = normalized.match(/\b(?:at|to)\s+(.+)/i);
  if (fallbackMatch?.[1]) {
    let source = fallbackMatch[1].trim().replace(/[.,;:]+$/g, '');
    source = source.replace(/\s+on\s+.*$/i, '').trim();
    if (source && !/^(?:a\/c|account|your|from)\b/i.test(source)) {
      return source;
    }
  }

  return null;
}

function isFastagExpense(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes('fastag') && !lower.includes('top up');
}

/**
 * Detects the category of the transaction from SMS text and type.
 */
function detectCategory(text: string, type: FinanceTransactionType): string {
  const lower = text.toLowerCase();
  if (isGrowwInvestmentText(text)) return 'Investment';
  if (lower.includes('meal wallet')) return 'Dining';
  if (lower.includes('abhirami')) return 'Personal';
  if (lower.includes('electricity')) return 'Utilities';
  if (lower.includes('upi'))
    return type === FinanceTransactionType.Income
      ? 'UPI Credit'
      : 'UPI Payment';
  if (lower.includes('atm')) return 'ATM';
  if (lower.includes('lulu') || lower.includes('amazon')) return 'Shopping';
  if (lower.includes('imps'))
    return type === FinanceTransactionType.Income
      ? 'Other Income'
      : 'Other Expense';
  if (lower.includes('neft'))
    return type === FinanceTransactionType.Income
      ? 'Other Income'
      : 'Other Expense';
  if (lower.includes('salary')) return 'Salary';
  if (lower.includes('restaurant')) return 'Dining';
  if (lower.includes('interest')) return 'Interest';
  if (lower.includes('refund')) return 'Refund';
  if (lower.includes('cashback')) return 'Cashback';
  if (lower.includes('dividend')) return 'Dividends';
  if (lower.includes('card'))
    return type === FinanceTransactionType.Income
      ? 'Card Credit'
      : 'Card Payment';
  return type === FinanceTransactionType.Income
    ? 'Other Income'
    : 'Other Expense';
}

/**
 * Detects the payment source from SMS text.
 */
function detectPaymentSource(text: string): PaymentSource {
  const lower = text.toLowerCase();
  if (lower.includes('wallet')) return PaymentSource.Wallet;
  if (
    lower.includes('card') ||
    lower.includes('credit card') ||
    lower.includes('debit card')
  ) {
    return PaymentSource.Card;
  }
  if (lower.includes('cash')) return PaymentSource.Cash;
  return PaymentSource.Account;
}

function isMessageLikelyPromotional(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes('offer') ||
    lower.includes('promo') ||
    lower.includes('eligible') ||
    lower.includes('discount') ||
    lower.includes("don't miss") ||
    lower.includes('2 loans. 1 processing fee') ||
    lower.includes('get instant') ||
    lower.includes('sale') ||
    lower.includes('apply') ||
    lower.includes('deal') ||
    lower.includes('minimum amount due')
  );
}

function detectSource(text: string, type: FinanceTransactionType): string {
  if (isGrowwInvestmentText(text)) return 'Stock Purchase';
  if (type === FinanceTransactionType.Expense) {
    const sourceName = extractSourceName(text);
    if (sourceName) return sourceName;
  }
  return 'sms_auto';
}

/**
 * Parses a finance-related SMS and returns a structured transaction object.
 * @param messageBody The SMS message body.
 * @param sender The sender of the SMS.
 * @returns ParsedFinanceSms or null if not parsable.
 */
export function parseFinanceSms(
  messageBody: string,
  sender?: string
): ParsedFinanceSms | null {
  const normalized = String(messageBody || '').trim();
  if (!normalized) return null;
  // Ignore OTP/authentication messages to avoid false transaction entries.
  if (
    /\bone[-\s]?time\s+password\b/i.test(normalized) ||
    /\botp\b/i.test(normalized)
  ) {
    return null;
  }
  // Ignore credit-card statement reminders (not actual transactions).
  if (
    /statement\s+is\s+sent\s+to/i.test(normalized) &&
    /minimum\s+of\s+rs\.?\s*[0-9,]+/i.test(normalized) &&
    /is\s+due\s+by/i.test(normalized)
  ) {
    return null;
  }
  if (isMessageLikelyPromotional(normalized)) return null;
  if (isFastagExpense(normalized)) return null;
  // Ignore reminder messages (e.g., bill due reminders)
  if (/is\s+due\s+on/i.test(normalized)) return null;
  const senderText = String(sender || '').trim();
  const combinedText = `${senderText} ${normalized}`.trim();

  const amount = parseAmount(combinedText);
  if (!amount) return null;

  const type = detectType(combinedText);
  if (!type) return null;
  const category = detectCategory(combinedText, type);
  const paymentSource = detectPaymentSource(combinedText);
  const source = detectSource(combinedText, type);

  return {
    type,
    amount,
    category,
    note: normalized.slice(0, 500),
    source,
    paymentSource,
  };
}
