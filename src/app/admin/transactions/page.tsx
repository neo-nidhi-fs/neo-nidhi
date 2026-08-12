'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, TrendingUp, Loader } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  age: number;
  dob?: Date;
  savingsBalance: number;
  loanBalance: number;
}

interface Transaction {
  _id: string;
  userId: string;
  type: 'deposit' | 'loan' | 'repayment' | 'fd' | 'rd' | 'withdrawal';
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

export default function AdminTransactionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [addTransactionLoading, setAddTransactionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [totalTransactionCount, setTotalTransactionCount] = useState(0);
  const [totalTransactionVolume, setTotalTransactionVolume] = useState(0);
  const [filterType, setFilterType] = useState('');
  const [dateRange, setDateRange] = useState('all'); // 'all', 'weekly', 'monthly', 'yearly', 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchData() {
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      setUsers(usersData.data);
      await fetchTransactions(1);
    }
    fetchData();
  }, [filterType, dateRange, customStartDate, customEndDate]);
  async function fetchTransactions(page = 1) {
    setLoading(true);
    try {
      let query = `/api/transactions?page=${page}&limit=${ITEMS_PER_PAGE}`;
      if (filterType) query += `&type=${filterType}`;

      // Date range logic
      const now = new Date();
      let startDate = '';
      let endDate = '';

      if (dateRange === 'weekly') {
        const lastWeek = new Date();
        lastWeek.setDate(now.getDate() - 7);
        startDate = lastWeek.toISOString();
      } else if (dateRange === 'monthly') {
        const lastMonth = new Date();
        lastMonth.setMonth(now.getMonth() - 1);
        startDate = lastMonth.toISOString();
      } else if (dateRange === 'yearly') {
        const lastYear = new Date();
        lastYear.setFullYear(now.getFullYear() - 1);
        startDate = lastYear.toISOString();
      } else if (dateRange === 'custom') {
        startDate = customStartDate;
        endDate = customEndDate;
      }

      if (startDate) query += `&startDate=${startDate}`;
      if (endDate)
        query += `&endDate=${new Date(new Date(endDate).getTime() + 86400000 - 1).toISOString()}`; // Set to end of the day
      const res = await fetch(query);
      const data = await res.json();
      setTransactions(data.data || []);
      setTotalTransactionCount(data.total ?? 0);
      setTotalTransactionVolume(data.totalAmount ?? 0);
      setTxPage(page);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTransaction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddTransactionLoading(true);
    const formData = new FormData(e.currentTarget);
    const userId = formData.get('userId') as string;
    const type = formData.get('type') as string;
    const amount = Number(formData.get('amount'));
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type, amount }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('✅ Transaction added successfully!');
        await fetchTransactions(1);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } finally {
      setAddTransactionLoading(false);
    }
  }

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">Loading dashboard...</p>
      </div>
    );
  }

  const transactionTypes = [
    { value: 'deposit', label: 'Deposit' },
    { value: 'fd', label: 'Fixed Deposit' },
    { value: 'rd', label: 'Recurring Deposit' },
    { value: 'loan', label: 'Loan' },
    { value: 'repayment', label: 'Repayment' },
    { value: 'withdrawal', label: 'Withdrawal' },
  ];

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'fd':
      case 'rd':
        return 'text-green-400';
      case 'loan':
        return 'text-orange-400';
      case 'repayment':
      case 'withdrawal':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getShortTransactionType = (type: string) => {
    const typeMap: Record<string, string> = {
      deposit: 'dep',
      loan: 'loan',
      repayment: 'rep',
      withdrawal: 'wd',
      fd: 'fd',
      rd: 'rd',
      interest_fd: 'int_fd',
      interest_rd: 'int_rd',
      interest_loan: 'int_loan',
      withdrawal_fd: 'wd_fd',
      interest_deposit: 'int_dep',
    };
    return typeMap[type] || type;
  };

  const transactionColumns = [
    { header: 'Date', accessor: 'date' },
    { header: 'User', accessor: 'name' },
    { header: 'Type', accessor: 'type' },
    { header: 'Amount', accessor: 'amount' },
    { header: 'Balance After Tx', accessor: 'userBalanceAfterTransaction' },
  ];
  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Transaction Management
            </span>
          </h1>
          <p className="text-gray-200 text-lg">
            Track and manage all user financial transactions
          </p>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-400/30 mb-12">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-cyan-400">
                Total Transaction Volume
              </CardTitle>
              <TrendingUp className="text-cyan-400" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-900">
              ₹{totalTransactionVolume.toFixed(2)}
            </p>
            <p className="text-gray-200 text-sm mt-2">
              Across {totalTransactionCount} transactions
            </p>
          </CardContent>
        </Card>

        {/* Add Transaction Button */}
        <div className="mb-6 flex gap-4">
          <Dialog
            open={transactionDialogOpen}
            onOpenChange={setTransactionDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold flex items-center gap-2">
                <Plus size={18} />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Add Transaction
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <Label htmlFor="userId" className="text-gray-100">
                    User
                  </Label>
                  <select
                    id="userId"
                    name="userId"
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 disabled:opacity-50"
                    required
                    disabled={addTransactionLoading}
                  >
                    <option value="">Select a user</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="type" className="text-gray-100">
                    Type
                  </Label>
                  <select
                    id="type"
                    name="type"
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 disabled:opacity-50"
                    required
                    disabled={addTransactionLoading}
                  >
                    <option value="">Select type</option>
                    {transactionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="amount" className="text-gray-100">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    required
                    disabled={addTransactionLoading}
                    className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={addTransactionLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addTransactionLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Transaction'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Filters */}
          <div className="flex gap-2 items-center flex-wrap">
            <select
              className="bg-slate-800 border border-slate-600 text-white rounded px-3 py-2 text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              {transactionTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <select
              className="bg-slate-800 border border-slate-600 text-white rounded px-3 py-2 text-sm"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="weekly">Last Week</option>
              <option value="monthly">Last Month</option>
              <option value="yearly">Last Year</option>
              <option value="custom">Custom Date</option>
            </select>

            {dateRange === 'custom' && (
              <>
                <Input
                  type="date"
                  className="bg-slate-800 border-slate-600 text-white w-auto"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
                <Input
                  type="date"
                  className="bg-slate-800 border-slate-600 text-white w-auto"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </>
            )}
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-3 rounded-lg text-sm ${
              message.includes('Error') || message.includes('❌')
                ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                : 'bg-green-500/10 border border-green-500/30 text-green-400'
            }`}
          >
            {message}
          </div>
        )}

        {/* Transactions Table */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-400">
              All Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {transactionColumns.map((col) => (
                    <TableHead key={col.accessor}>{col.header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const user = users.find((u) => u._id === tx.userId);
                  return (
                    <TableRow key={tx._id}>
                      <TableCell className="text-gray-200">
                        {new Date(tx.date).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell className="text-gray-200">
                        {user?.name || 'Unknown'}
                      </TableCell>
                      <TableCell
                        className={`capitalize font-semibold ${getTransactionColor(
                          tx.type
                        )}`}
                      >
                        <span className="sm:hidden">
                          {getShortTransactionType(tx.type)}
                        </span>
                        <span className="hidden sm:inline">{tx.type}</span>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-200">
                        ₹{tx.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-gray-200 min-w-[240px]">
                        {tx.userBalanceAfterTransaction ? (
                          <div>
                            S ₹
                            {tx.userBalanceAfterTransaction.savingsBalance.toFixed(
                              2
                            )}{' '}
                            | FD ₹
                            {tx.userBalanceAfterTransaction.fdBalance.toFixed(
                              2
                            )}{' '}
                            | RD ₹
                            {tx.userBalanceAfterTransaction.rdBalance.toFixed(
                              2
                            )}{' '}
                            | L ₹
                            {tx.userBalanceAfterTransaction.loanBalance.toFixed(
                              2
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {totalTransactionCount > ITEMS_PER_PAGE && (
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-400">
                  Showing {(txPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                  {Math.min(txPage * ITEMS_PER_PAGE, totalTransactionCount)} of{' '}
                  {totalTransactionCount} transactions
                </p>
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end">
                  <Button
                    onClick={() => fetchTransactions(Math.max(1, txPage - 1))}
                    disabled={txPage === 1}
                    className="bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Previous
                  </Button>
                  <div className="hidden sm:flex items-center gap-2">
                    {(() => {
                      const totalPages = Math.ceil(
                        totalTransactionCount / ITEMS_PER_PAGE
                      );
                      const maxPagesToShow = 5;
                      let startPage = Math.max(
                        1,
                        txPage - Math.floor(maxPagesToShow / 2)
                      );
                      const endPage = Math.min(
                        totalPages,
                        startPage + maxPagesToShow - 1
                      );

                      if (endPage - startPage + 1 < maxPagesToShow) {
                        startPage = Math.max(1, endPage - maxPagesToShow + 1);
                      }

                      return Array.from({
                        length: endPage - startPage + 1,
                      }).map((_, i) => {
                        const pageNum = startPage + i;
                        return (
                          <Button
                            key={pageNum}
                            onClick={() => fetchTransactions(pageNum)}
                            className={`w-10 h-10 text-sm ${
                              txPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                            }`}
                          >
                            {pageNum}
                          </Button>
                        );
                      });
                    })()}
                  </div>
                  <div className="sm:hidden text-sm text-gray-400">
                    Page {txPage}
                  </div>
                  <Button
                    onClick={() =>
                      fetchTransactions(
                        Math.min(
                          Math.ceil(totalTransactionCount / ITEMS_PER_PAGE),
                          txPage + 1
                        )
                      )
                    }
                    disabled={
                      txPage ===
                      Math.ceil(totalTransactionCount / ITEMS_PER_PAGE)
                    }
                    className="bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
