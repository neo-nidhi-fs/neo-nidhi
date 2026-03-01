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
}

interface TransactionTableProps {
  transactions: Transaction[];
  page: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function TransactionTable({
  transactions,
  page,
  itemsPerPage,
  onPageChange,
}: TransactionTableProps) {
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'fd':
        return 'text-green-400';
      case 'loan':
        return 'text-orange-400';
      case 'repayment':
      case 'withdrawal':
        return 'text-blue-400';
      default:
        return 'text-gray-300';
    }
  };

  const getShortTransactionType = (type: string) => {
    const typeMap: Record<string, string> = {
      deposit: 'dep',
      loan: 'loan',
      repayment: 'rep',
      withdrawal: 'wd',
      fd: 'fd',
      interest_fd: 'int_fd',
      interest_loan: 'int_loan',
      withdrawal_fd: 'wd_fd',
      interest_deposit: 'int_dep',
    };
    return typeMap[type] || type;
  };

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIdx = (page - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedTransactions = transactions.slice(startIdx, endIdx);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((tx) => (
                <TableRow key={tx._id}>
                  <TableCell className="text-gray-200">
                    {new Date(tx.date).toLocaleDateString('en-IN')}
                  </TableCell>
                  <TableCell
                    className={`capitalize font-semibold ${getTransactionColor(tx.type)}`}
                  >
                    <span className="sm:hidden">{getShortTransactionType(tx.type)}</span>
                    <span className="hidden sm:inline">{tx.type}</span>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-200">
                    ₹{tx.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-400 py-8">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {transactions.length > itemsPerPage && (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-400">
            Showing {startIdx + 1} to {Math.min(endIdx, transactions.length)} of{' '}
            {transactions.length} transactions
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
