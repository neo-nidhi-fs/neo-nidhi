'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { Loader, History } from 'lucide-react';
import { TransactionTable } from '@/components/passbook/TransactionTable';

type Transaction = {
  _id: string;
  type: string;
  amount: number;
  date: string;
  relatedUserName?: string;
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
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchTransactions() {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/users/${session.user.id}/transactions`);
        const data = await res.json();
        setTransactions(data.data || []);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">Loading passbook...</p>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Transaction Passbook
            </span>
          </h1>
          <p className="text-gray-200 text-lg">View your complete transaction history</p>
        </div>

        {/* Stats Card */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-400/30 mb-12">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-cyan-400">Total Transactions</CardTitle>
              <History className="text-cyan-400" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-900">{transactions.length}</p>
            <p className="text-gray-200 text-sm mt-2">Transaction records on file</p>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-400">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable
              transactions={transactions}
              page={page}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
