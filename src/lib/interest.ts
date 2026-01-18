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
