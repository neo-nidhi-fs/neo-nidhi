'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, DollarSign, CreditCard } from 'lucide-react';

interface MetricsCardsProps {
  savingsBalance: number;
  fdBalance: number;
  loanBalance: number;
}

export function MetricsCards({
  savingsBalance,
  fdBalance,
  loanBalance,
}: MetricsCardsProps) {
  const cards = [
    {
      label: 'Current Savings',
      value: `₹${savingsBalance.toFixed(2)}`,
      bgGradient: 'from-green-900/30 to-emerald-900/30',
      borderColor: 'border-green-400/30',
      textColor: 'text-green-400',
      icon: Wallet,
    },
    {
      label: 'Current FD Balance',
      value: `₹${fdBalance.toFixed(2)}`,
      bgGradient: 'from-amber-900/30 to-orange-900/30',
      borderColor: 'border-amber-400/30',
      textColor: 'text-amber-400',
      icon: DollarSign,
    },
    {
      label: 'Active Loan Balance',
      value: `₹${loanBalance.toFixed(2)}`,
      bgGradient: 'from-red-900/30 to-pink-900/30',
      borderColor: 'border-red-400/30',
      textColor: 'text-red-400',
      icon: CreditCard,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.label}
            className={`bg-gradient-to-br ${card.bgGradient} ${card.borderColor}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-lg ${card.textColor}`}>
                  {card.label}
                </CardTitle>
                <Icon className={card.textColor} size={24} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-200">{card.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function QuickStatsCards({
  metrics,
}: {
  metrics: {
    totalDeposits: number;
    totalWithdrawals: number;
    totalInterestEarned: number;
    totalTransactions: number;
  };
}) {
  const stats = [
    {
      label: 'Total Deposits',
      value: `₹${metrics.totalDeposits.toFixed(2)}`,
      bgGradient: 'from-blue-900/30 to-cyan-900/30',
      borderColor: 'border-blue-400/30',
      textColor: 'text-blue-400',
    },
    {
      label: 'Total Withdrawals',
      value: `₹${metrics.totalWithdrawals.toFixed(2)}`,
      bgGradient: 'from-purple-900/30 to-indigo-900/30',
      borderColor: 'border-purple-400/30',
      textColor: 'text-purple-400',
    },
    {
      label: 'Interest Earned',
      value: `₹${metrics.totalInterestEarned.toFixed(2)}`,
      bgGradient: 'from-cyan-900/30 to-teal-900/30',
      borderColor: 'border-cyan-400/30',
      textColor: 'text-cyan-400',
    },
    {
      label: 'Total Transactions',
      value: metrics.totalTransactions,
      bgGradient: 'from-violet-900/30 to-purple-900/30',
      borderColor: 'border-violet-400/30',
      textColor: 'text-violet-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className={`bg-gradient-to-br ${stat.bgGradient} ${stat.borderColor}`}
        >
          <CardContent className="pt-6">
            <p className={`text-sm ${stat.textColor} mb-2`}>{stat.label}</p>
            <p className="text-3xl font-bold text-gray-200">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
