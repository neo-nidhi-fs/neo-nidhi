export function calculateInterestFromTransactions(
  transactions: { type: string; amount: number; date: Date }[],
  annualRate: number,
  currentDate: Date
): number {
  const monthlyRate = annualRate / 12 / 100;
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  let totalInterest = 0;

  for (const tx of transactions) {
    if (tx.type !== 'deposit') continue; // only deposits earn interest

    // Check if deposit was withdrawn later
    const withdrawals = transactions.filter(
      (w) => w.type === 'withdrawal' && w.date > tx.date
    );
    const withdrawnAmount = withdrawals.reduce((sum, w) => sum + w.amount, 0);

    const activeAmount = tx.amount - withdrawnAmount;
    if (activeAmount <= 0) continue;

    // Days active in this month
    const daysActive =
      (currentDate.getTime() - tx.date.getTime()) / (1000 * 60 * 60 * 24);

    if (daysActive < 0) continue;

    const proRataFactor = Math.min(daysActive / daysInMonth, 1);
    const interest = activeAmount * monthlyRate * proRataFactor;
    totalInterest += interest;
  }

  return parseFloat(totalInterest.toFixed(2));
}

/**
 * Calculate maturity value for Recurring Deposit (RD)
 * Using the formula: FV = P × [((1 + r)^n - 1) / r] × (1 + r)
 * Where:
 * - P = Monthly installment
 * - r = Monthly interest rate (annual rate / 12 / 100)
 * - n = Number of installments (months)
 */
export function calculateRecurringDepositMaturity(
  monthlyInstallment: number,
  annualRate: number,
  months: number
): number {
  if (monthlyInstallment <= 0 || annualRate <= 0 || months <= 0) {
    return 0;
  }

  const monthlyRate = annualRate / 12 / 100;

  // FV = P × [((1 + r)^n - 1) / r] × (1 + r)
  const compoundFactor = Math.pow(1 + monthlyRate, months) - 1;
  const maturityValue =
    monthlyInstallment * (compoundFactor / monthlyRate) * (1 + monthlyRate);

  return parseFloat(maturityValue.toFixed(2));
}

/**
 * Calculate Fixed Deposit (FD) maturity value
 * Using simple interest formula: A = P × (1 + r × t)
 * Where:
 * - P = Principal amount
 * - r = Annual interest rate
 * - t = Time in years
 */
export function calculateFixedDepositMaturity(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (principal <= 0 || annualRate <= 0 || months <= 0) {
    return 0;
  }

  const years = months / 12;
  const maturityValue = principal * (1 + (annualRate / 100) * years);

  return parseFloat(maturityValue.toFixed(2));
}
