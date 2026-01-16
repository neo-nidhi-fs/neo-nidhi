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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, TrendingUp } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  age: number;
  savingsBalance: number;
  loanBalance: number;
}

interface Transaction {
  _id: string;
  userId: string;
  type: 'deposit' | 'loan' | 'repayment' | 'fd' | 'withdrawal';
  amount: number;
  date: string;
}

export default function AdminTransactionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      setUsers(usersData.data);

      const txRes = await fetch('/api/transactions');
      const txData = await txRes.json();
      setTransactions(txData.data);

      setLoading(false);
    }
    fetchData();
  }, []);

  async function handleAddTransaction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userId = formData.get('userId') as string;
    const type = formData.get('type') as string;
    const amount = Number(formData.get('amount'));

    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type, amount }),
    });

    const data = await res.json();
    if (res.ok) {
      setTransactions((prev) => [...prev, data.data]);
    } else {
      alert(`Error: ${data.error}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  const transactionTypes = [
    { value: 'deposit', label: 'Deposit' },
    { value: 'fd', label: 'Fixed Deposit' },
    { value: 'loan', label: 'Loan' },
    { value: 'repayment', label: 'Repayment' },
    { value: 'withdrawal', label: 'Withdrawal' },
  ];

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
        return 'text-gray-400';
    }
  };

  const totalTransactions = transactions.reduce(
    (sum, tx) => sum + tx.amount,
    0
  );

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
          <p className="text-gray-400 text-lg">
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
            <p className="text-4xl font-bold">
              ₹{totalTransactions.toLocaleString()}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Across {transactions.length} transactions
            </p>
          </CardContent>
        </Card>

        {/* Add Transaction Button */}
        <div className="mb-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold flex items-center gap-2">
                <Plus size={18} />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Add Transaction
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                {/* Select User */}
                <div>
                  <Label htmlFor="userId" className="text-gray-300">
                    User
                  </Label>
                  <select
                    id="userId"
                    name="userId"
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                    required
                  >
                    <option value="">Select a user</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transaction Type */}
                <div>
                  <Label htmlFor="type" className="text-gray-300">
                    Type
                  </Label>
                  <select
                    id="type"
                    name="type"
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                    required
                  >
                    <option value="">Select type</option>
                    {transactionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <Label htmlFor="amount" className="text-gray-300">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold"
                >
                  Add Transaction
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Transactions Table */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl">All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                      User
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const user = users.find((u) => u._id === tx.userId);
                    return (
                      <tr
                        key={tx._id}
                        className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="py-3 px-4">{user?.name || 'Unknown'}</td>
                        <td
                          className={`py-3 px-4 capitalize font-semibold ${getTransactionColor(tx.type)}`}
                        >
                          {tx.type}
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          ₹{tx.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
