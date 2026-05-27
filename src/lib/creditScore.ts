import { ITransaction } from '@/models/Transaction';

export interface CreditScoreResult {
  score: number;
  rating: 'Poor' | 'Fair' | 'Good' | 'Very Good' | 'Excellent';
  factors: {
    totalLoanAmount: number;
    totalRepaymentAmount: number;
    repaymentCount: number;
    outstandingLoanAmount: number;
    lastRepaymentDate: Date | null;
    repaymentRatio: number;
  };
}

function getRating(score: number): CreditScoreResult['rating'] {
  if (score >= 800) return 'Excellent';
  if (score >= 740) return 'Very Good';
  if (score >= 670) return 'Good';
  if (score >= 580) return 'Fair';
  return 'Poor';
}

export function calculateInAppCreditScore(
  transactions: Array<Pick<ITransaction, 'type' | 'amount' | 'date'>>,
  now = new Date()
): CreditScoreResult {
  const loanTransactions = transactions
    .filter((tx) => tx.type === 'loan' || tx.type === 'repayment')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalLoanAmount = loanTransactions
    .filter((tx) => tx.type === 'loan')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalRepaymentAmount = loanTransactions
    .filter((tx) => tx.type === 'repayment')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const repayments = loanTransactions.filter((tx) => tx.type === 'repayment');
  const repaymentCount = repayments.length;
  const outstandingLoanAmount = Math.max(0, totalLoanAmount - totalRepaymentAmount);
  const lastRepaymentDate =
    repaymentCount > 0 ? new Date(repayments[repaymentCount - 1].date) : null;
  const repaymentRatio =
    totalLoanAmount > 0 ? Math.min(1, totalRepaymentAmount / totalLoanAmount) : 0;

  // 1) Repayment coverage: up to 45%
  const coverageScore = repaymentRatio;
  // 2) Repayment history depth: up to 15%
  const historyScore = Math.min(1, repaymentCount / 12);
  // 3) Utilization proxy (lower outstanding on borrowed amount is better): up to 25%
  const utilizationRatio =
    totalLoanAmount > 0 ? outstandingLoanAmount / totalLoanAmount : 1;
  const utilizationScore = totalLoanAmount > 0 ? 1 - Math.min(1, utilizationRatio) : 0;
  // 4) Recency of repayment: up to 15%
  let recencyScore = 0;
  if (lastRepaymentDate) {
    const daysSinceLastRepayment =
      (now.getTime() - lastRepaymentDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastRepayment <= 45) recencyScore = 1;
    else if (daysSinceLastRepayment <= 90) recencyScore = 0.6;
    else if (daysSinceLastRepayment <= 180) recencyScore = 0.3;
  }

  const normalized =
    coverageScore * 0.45 +
    historyScore * 0.15 +
    utilizationScore * 0.25 +
    recencyScore * 0.15;

  const score = Math.round(300 + normalized * 600);

  return {
    score,
    rating: getRating(score),
    factors: {
      totalLoanAmount,
      totalRepaymentAmount,
      repaymentCount,
      outstandingLoanAmount,
      lastRepaymentDate,
      repaymentRatio,
    },
  };
}

