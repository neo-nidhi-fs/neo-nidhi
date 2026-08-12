'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  date: string;
  userBalanceAfterTransaction?: {
    userId: string;
    name: string;
    savingsBalance: number;
    fdBalance: number;
    rdBalance: number;
    loanBalance: number;
  } | null;
}

interface TransactionTableProps {
  transactions: Transaction[];
  page: number;
  itemsPerPage: number;
  totalCount?: number;
  balanceColumns?: {
    fd: boolean;
    rd: boolean;
    loan: boolean;
  };
  onPageChange: (page: number) => void;
}

export function TransactionTable({
  transactions,
  page,
  itemsPerPage,
  totalCount,
  balanceColumns = { fd: true, rd: true, loan: true },
  onPageChange,
}: TransactionTableProps) {
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'fd':
      case 'interest_fd':
      case 'interest_deposit':
        return 'text-green-400';
      case 'rd':
      case 'interest_rd':
        return 'text-cyan-400';
      case 'loan':
      case 'interest_loan':
        return 'text-orange-400';
      case 'repayment':
      case 'withdrawal':
      case 'withdrawal_fd':
        return 'text-blue-400';
      default:
        return 'text-gray-300';
    }
  };

  const typeMap: Record<string, string> = {
    deposit: 'Deposit',
    loan: 'Loan',
    repayment: 'Repayment',
    withdrawal: 'Withdrawal',
    fd: 'FD',
    interest_fd: 'FD Int',
    rd: 'RD',
    interest_rd: 'RD Int',
    interest_loan: 'Loan Int',
    withdrawal_fd: 'FD Withdrawal',
    interest_deposit: 'Deposit Int',
  };

  const totalItems = totalCount ?? transactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIdx = (page - 1) * itemsPerPage;
  const endIdx = startIdx + transactions.length;
  const formatBalanceParts = (
    balance: NonNullable<Transaction['userBalanceAfterTransaction']>
  ) => {
    const parts = [`Savings ₹${balance.savingsBalance.toFixed(2)}`];
    if (balanceColumns.fd) {
      parts.push(`FD ₹${balance.fdBalance.toFixed(2)}`);
    }
    if (balanceColumns.rd) {
      parts.push(`RD ₹${balance.rdBalance.toFixed(2)}`);
    }
    if (balanceColumns.loan) {
      parts.push(`Loan ₹${balance.loanBalance.toFixed(2)}`);
    }
    return parts.join(' | ');
  };

  return (
    <div className="space-y-4">
      {/* Mobile Grid View */}
      <div className="md:hidden space-y-3">
        {transactions.length > 0 ? (
          transactions.map((tx) => (
            <div
              key={tx._id}
              className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-gray-400 text-xs">
                  {new Date(tx.date).toLocaleDateString('en-IN')}{' '}
                  {new Date(tx.date).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span
                  className={`capitalize font-semibold ${getTransactionColor(tx.type)}`}
                >
                  {typeMap[tx.type] || tx.type}
                </span>
              </div>
              <div className="text-xl font-bold text-white mb-2">
                ₹{tx.amount.toFixed(2)}
              </div>
              {tx.userBalanceAfterTransaction && (
                <div className="text-xs text-gray-300 bg-slate-900/50 p-3 rounded">
                  {formatBalanceParts(tx.userBalanceAfterTransaction)}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 py-8">
            No transactions found
          </p>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Balance After Tx</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <TableRow key={tx._id}>
                  <TableCell className="text-gray-200">
                    {new Date(tx.date).toLocaleDateString('en-IN')}
                  </TableCell>
                  <TableCell
                    className={`capitalize font-semibold ${getTransactionColor(tx.type)}`}
                  >
                    {tx.type}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-200">
                    ₹{tx.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-xs text-gray-200 min-w-[240px]">
                    {tx.userBalanceAfterTransaction ? (
                      <div>
                        {formatBalanceParts(tx.userBalanceAfterTransaction)}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-gray-400 py-8"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalItems > itemsPerPage && (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-400">
            Showing {startIdx + 1} to {Math.min(endIdx, totalItems)} of{' '}
            {totalItems} transactions
          </p>
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end">
            <Button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </Button>
            <div className="hidden sm:flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i + 1}
                  onClick={() => onPageChange(i + 1)}
                  className={`w-10 h-10 text-sm ${
                    page === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <div className="sm:hidden text-sm text-gray-400">Page {page}</div>
            <Button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
