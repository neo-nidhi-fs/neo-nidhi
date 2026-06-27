import { Types } from 'mongoose';

type TxLike = {
  _id: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  type: string;
  amount: number;
  date: Date | string;
};

type UserLike = {
  _id: Types.ObjectId | string;
  name: string;
  savingsBalance?: number;
  fd?: number;
  rd?: number;
  loanBalance?: number;
};

export type BalanceSnapshotUser = {
  userId: string;
  name: string;
  savingsBalance: number;
  fdBalance: number;
  rdBalance: number;
  loanBalance: number;
};

type RunningBalance = {
  userId: string;
  name: string;
  savingsBalance: number;
  fdBalance: number;
  rdBalance: number;
  loanBalance: number;
};

function undoTransaction(balance: RunningBalance, tx: TxLike) {
  switch (tx.type) {
    case 'deposit':
    case 'interest_deposit':
    case 'challenge_reward':
      balance.savingsBalance -= tx.amount;
      break;
    case 'withdrawal':
    case 'challenge_fee':
      balance.savingsBalance += tx.amount;
      break;
    case 'fd':
    case 'interest_fd':
      balance.fdBalance -= tx.amount;
      break;
    case 'withdrawal_fd':
      balance.fdBalance += tx.amount;
      balance.savingsBalance -= tx.amount;
      break;
    case 'rd':
    case 'interest_rd':
      balance.rdBalance -= tx.amount;
      if (tx.type === 'rd') {
        balance.savingsBalance += tx.amount;
      }
      break;
    case 'loan':
    case 'interest_loan':
      balance.loanBalance -= tx.amount;
      break;
    case 'repayment':
      balance.loanBalance += tx.amount;
      balance.savingsBalance += tx.amount;
      break;
    default:
      break;
  }

  balance.savingsBalance = Math.max(0, balance.savingsBalance);
  balance.fdBalance = Math.max(0, balance.fdBalance);
  balance.rdBalance = Math.max(0, balance.rdBalance);
  balance.loanBalance = Math.max(0, balance.loanBalance);
}

export function buildTransactionBalanceSnapshots(
  allTransactionsAsc: TxLike[],
  users: UserLike[]
): Map<string, BalanceSnapshotUser> {
  const balances = new Map<string, RunningBalance>();
  const snapshotsByTxId = new Map<string, BalanceSnapshotUser>();

  for (const user of users) {
    const userId = String(user._id);
    balances.set(userId, {
      userId,
      name: user.name,
      savingsBalance: user.savingsBalance ?? 0,
      fdBalance: user.fd ?? 0,
      rdBalance: user.rd ?? 0,
      loanBalance: user.loanBalance ?? 0,
    });
  }

  const allTransactionsDesc = [...allTransactionsAsc].reverse();
  for (const tx of allTransactionsDesc) {
    const userId = String(tx.userId);
    const current = balances.get(userId);
    if (!current) continue;

    snapshotsByTxId.set(String(tx._id), { ...current });
    undoTransaction(current, tx);
  }

  return snapshotsByTxId;
}
