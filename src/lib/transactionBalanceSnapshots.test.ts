import { describe, it, expect } from 'vitest';
import { buildTransactionBalanceSnapshots } from './transactionBalanceSnapshots';

type TxLike = {
  _id: string;
  userId: string;
  type: string;
  amount: number;
  date: Date;
};

type UserLike = {
  _id: string;
  name: string;
  savingsBalance: number;
  fd: number;
  rd: number;
  loanBalance: number;
};

describe('buildTransactionBalanceSnapshots', () => {
  it('builds reverse balance snapshots for each transaction', () => {
    const users: UserLike[] = [
      {
        _id: 'user-1',
        name: 'Alice',
        savingsBalance: 1000,
        fd: 200,
        rd: 100,
        loanBalance: 500,
      },
    ];

    const transactions: TxLike[] = [
      {
        _id: 'tx-1',
        userId: 'user-1',
        type: 'deposit',
        amount: 100,
        date: new Date('2024-01-01'),
      },
      {
        _id: 'tx-2',
        userId: 'user-1',
        type: 'withdrawal',
        amount: 50,
        date: new Date('2024-01-02'),
      },
    ];

    const snapshots = buildTransactionBalanceSnapshots(transactions, users);

    expect(snapshots.get('tx-1')).toEqual({
      userId: 'user-1',
      name: 'Alice',
      savingsBalance: 1050,
      fdBalance: 200,
      rdBalance: 100,
      loanBalance: 500,
    });

    expect(snapshots.get('tx-2')).toEqual({
      userId: 'user-1',
      name: 'Alice',
      savingsBalance: 1000,
      fdBalance: 200,
      rdBalance: 100,
      loanBalance: 500,
    });
  });

  it('treats RD deposits as savings-funded installments', () => {
    const users: UserLike[] = [
      {
        _id: 'user-1',
        name: 'Alice',
        savingsBalance: 900,
        fd: 0,
        rd: 100,
        loanBalance: 0,
      },
    ];

    const transactions: TxLike[] = [
      {
        _id: 'tx-1',
        userId: 'user-1',
        type: 'deposit',
        amount: 1000,
        date: new Date('2024-01-01'),
      },
      {
        _id: 'tx-2',
        userId: 'user-1',
        type: 'rd',
        amount: 100,
        date: new Date('2024-01-02'),
      },
    ];

    const snapshots = buildTransactionBalanceSnapshots(transactions, users);

    expect(snapshots.get('tx-1')).toEqual({
      userId: 'user-1',
      name: 'Alice',
      savingsBalance: 1000,
      fdBalance: 0,
      rdBalance: 0,
      loanBalance: 0,
    });

    expect(snapshots.get('tx-2')).toEqual({
      userId: 'user-1',
      name: 'Alice',
      savingsBalance: 900,
      fdBalance: 0,
      rdBalance: 100,
      loanBalance: 0,
    });
  });
});
