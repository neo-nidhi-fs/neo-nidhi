import { Transaction } from '@/models/Transaction';

interface BalanceUpdate {
  savingsBalance: number;
  fdBalance: number;
  loanBalance: number;
}

// Recalculate balances from transactions
export async function recalculateBalances(
  userId: string
): Promise<BalanceUpdate> {
  const transactions = await Transaction.find({ userId }).sort({ date: 1 });

  let savingsBalance = 0;
  let fdBalance = 0;
  let loanBalance = 0;

  for (const tx of transactions) {
    switch (tx.type) {
      case 'deposit':
        savingsBalance += tx.amount;
        break;
      case 'withdrawal':
        savingsBalance -= tx.amount;
        break;
      case 'fd':
        fdBalance += tx.amount;
        break;
      case 'loan':
        loanBalance += tx.amount;
        break;
      case 'repayment':
        loanBalance -= tx.amount;
        break;
      case 'interest_deposit':
        savingsBalance += tx.amount;
        break;
      case 'interest_fd':
        fdBalance += tx.amount;
        break;
      case 'interest_loan':
        loanBalance += tx.amount;
        break;
      default:
        // Interest is added to respective balance based on deposit type
        // Handle interest transactions separately
        break;
    }
  }

  // Ensure no negative balances
  return {
    savingsBalance: Math.max(0, savingsBalance),
    fdBalance: Math.max(0, fdBalance),
    loanBalance: Math.max(0, loanBalance),
  };
}
