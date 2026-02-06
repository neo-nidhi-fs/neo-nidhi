'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';

type Transaction = {
  _id: string;
  type: string;
  amount: number;
  date: string;
};

interface CustomSession extends Session {
  user?: Session['user'] & {
    role?: string;
    id?: string;
  };
}

export default function PassbookPage() {
  const { data: session } = useSession() as { data: CustomSession | null };
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [passPage, setPassPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchTransactions() {
      if (!session?.user?.id) return;
      const res = await fetch(`/api/users/${session.user.id}/transactions`);
      const data = await res.json();
      setTransactions(data.data);
      setLoading(false);
    }
    fetchTransactions();
  }, [session]);

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

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">Loading passbook...</p>
      </div>
    );

  const passbookColumns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Type', accessor: 'type' },
    { header: 'Amount', accessor: 'amount' },
  ];

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Transaction Passbook
            </span>
          </h1>
          <p className="text-gray-200 text-lg">
            View your complete transaction history
          </p>
        </div>

        {/* Stats Card */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-400/30 mb-12">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-cyan-400">
                Total Transactions
              </CardTitle>
              <History className="text-cyan-400" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-900">
              {transactions.length}
            </p>
            <p className="text-gray-200 text-sm mt-2">
              Transaction records on file
            </p>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-400">
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {passbookColumns.map((col) => (
                      <TableHead key={col.accessor}>{col.header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions
                      .slice((passPage - 1) * ITEMS_PER_PAGE, passPage * ITEMS_PER_PAGE)
                      .map((tx) => (
                        <TableRow key={tx._id}>
                          <TableCell className="text-gray-200">
                            {new Date(tx.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell
                            className={`capitalize font-semibold ${getTransactionColor(
                              tx.type
                            )}`}
                          >
                            {tx.type}
                          </TableCell>
                          <TableCell className="font-semibold text-gray-200">
                            ₹{tx.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-gray-400 py-8"
                      >
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {transactions.length > ITEMS_PER_PAGE && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Showing {(passPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(passPage * ITEMS_PER_PAGE, transactions.length)} of {transactions.length} transactions
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPassPage((p) => Math.max(1, p - 1))}
                    disabled={passPage === 1}
                    className="bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.ceil(transactions.length / ITEMS_PER_PAGE) }).map((_, i) => (
                      <Button
                        key={i + 1}
                        onClick={() => setPassPage(i + 1)}
                        className={`w-10 h-10 ${
                          passPage === i + 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={() => setPassPage((p) => Math.min(Math.ceil(transactions.length / ITEMS_PER_PAGE), p + 1))}
                    disabled={passPage === Math.ceil(transactions.length / ITEMS_PER_PAGE)}
                    className="bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
