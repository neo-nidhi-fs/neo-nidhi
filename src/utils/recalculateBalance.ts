import { Transaction } from '@/models/Transaction';

interface BalanceUpdate {
  savingsBalance: number;
  fdBalance: number;
  rdBalance: number;
  loanBalance: number;
}

// Recalculate balances from transactions
export async function recalculateBalances(
  userId: string
): Promise<BalanceUpdate> {
  const transactions = await Transaction.find({ userId }).sort({ date: 1 });

  let savingsBalance = 0;
  let fdBalance = 0;
  let rdBalance = 0;
  let loanBalance = 0;

  for (const tx of transactions) {
    switch (tx.type) {
      case 'deposit':
        savingsBalance += tx.amount;
        break;
      case 'rd_new_maturity':
        savingsBalance += tx.amount;
        rdBalance -= tx.amount; // Deduct from RD balance on maturity
        break;
      case 'withdrawal':
        savingsBalance -= tx.amount;
        break;
      case 'withdrawal_fd':
        fdBalance -= tx.amount;
        savingsBalance += tx.amount; // Add back to savings on FD withdrawal
        break;
      case 'fd':
        fdBalance += tx.amount;
        break;
      case 'rd':
        savingsBalance -= tx.amount;
        rdBalance += tx.amount;
        break;
      case 'rd_new':
        console.log('rd_new transaction ==> ', tx, rdBalance);
        rdBalance += tx.amount;
        console.log('rd_new transaction ==> ', tx, rdBalance, tx.amount);
        break;
      case 'loan':
        loanBalance += tx.amount;
        break;
      case 'repayment':
        // A loan repayment should reduce both the outstanding loan and the available savings.
        // This keeps the user balance in sync with the UI flows that deduct repayment from deposit.
        loanBalance -= tx.amount;
        savingsBalance -= tx.amount;
        break;
      case 'interest_deposit':
        savingsBalance += tx.amount;
        break;
      case 'interest_fd':
        fdBalance += tx.amount;
        break;
      case 'interest_rd':
        rdBalance += tx.amount;
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
    rdBalance: Math.max(0, rdBalance),
    loanBalance: Math.max(0, loanBalance),
  };
}
