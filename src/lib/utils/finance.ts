import { CashFlow, ExpensePaymentSource } from '@/hooks/useUserFinance';

export const PAYMENT_MODES: Array<'account' | 'cash' | 'card' | 'wallet'> = [
  'account',
  'cash',
  'card',
  'wallet',
];

export const normalizePaymentSource = (
  paymentSource?: ExpensePaymentSource
): 'account' | 'cash' | 'card' | 'wallet' => {
  if (paymentSource === 'credit_card') return 'card';
  if (
    paymentSource === 'cash' ||
    paymentSource === 'card' ||
    paymentSource === 'wallet'
  ) {
    return paymentSource;
  }
  return 'account';
};

export const labelPaymentSource = (paymentSource?: ExpensePaymentSource): string => {
  const p = normalizePaymentSource(paymentSource);
  const labels: Record<'account' | 'cash' | 'card' | 'wallet', string> = {
    account: 'Account',
    cash: 'Cash',
    card: 'Card',
    wallet: 'Wallet',
  };
  return labels[p];
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};
