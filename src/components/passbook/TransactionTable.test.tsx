import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TransactionTable } from './TransactionTable';

type Transaction = {
  _id: string;
  type: string;
  amount: number;
  date: string;
  userBalanceAfterTransaction?: {
    savingsBalance: number;
    fdBalance: number;
    rdBalance: number;
    loanBalance: number;
  } | null;
};

const transactions: Transaction[] = Array.from({ length: 15 }).map((_, index) => ({
  _id: `tx-${index}`,
  type: index % 2 === 0 ? 'deposit' : 'withdrawal',
  amount: 100 + index,
  date: new Date(2024, 0, index + 1).toISOString(),
  userBalanceAfterTransaction: {
    savingsBalance: 1000 + index,
    fdBalance: 200 + index,
    rdBalance: 300 + index,
    loanBalance: 400 + index,
  },
}));

describe('TransactionTable', () => {
  it('renders the provided transactions and pagination controls', async () => {
    render(
      <TransactionTable
        transactions={transactions.slice(0, 10)}
        page={1}
        itemsPerPage={10}
        totalCount={15}
        onPageChange={() => {}}
      />
    );

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Balance After Tx')).toBeInTheDocument();
    expect(screen.getByText('Showing 1 to 10 of 15 transactions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
  });

  it('renders an empty state when there are no transactions', () => {
    render(
      <TransactionTable
        transactions={[]}
        page={1}
        itemsPerPage={10}
        totalCount={0}
        onPageChange={() => {}}
      />
    );

    expect(screen.getByText('No transactions found')).toBeInTheDocument();
  });

  it('calls onPageChange when next page is clicked', async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();

    render(
      <TransactionTable
        transactions={transactions.slice(0, 10)}
        page={1}
        itemsPerPage={10}
        totalCount={15}
        onPageChange={handlePageChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /Next/i }));
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });
});
