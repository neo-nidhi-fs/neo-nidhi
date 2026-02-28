'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Banknote, TrendingDown } from 'lucide-react';

interface User {
  savingsBalance?: number;
  fd?: number;
  loanBalance?: number;
}

export function DashboardStats({ user }: { user: User }) {
  const stats = [
    {
      label: 'Savings Balance',
      value: `₹${user.savingsBalance?.toFixed(2) || '0.00'}`,
      bgGradient: 'from-green-900/30 to-emerald-900/30',
      borderColor: 'border-green-400/30',
      textColor: 'text-green-400',
      icon: Wallet,
    },
    {
      label: 'Fixed Deposit',
      value: `₹${(user.fd || 0)?.toFixed(2) || '0.00'}`,
      bgGradient: 'from-blue-900/30 to-indigo-900/30',
      borderColor: 'border-blue-400/30',
      textColor: 'text-blue-400',
      icon: Banknote,
    },
    {
      label: 'Loan Balance',
      value: `₹${user.loanBalance?.toFixed(2) || '0.00'}`,
      bgGradient: 'from-orange-900/30 to-red-900/30',
      borderColor: 'border-orange-400/30',
      textColor: 'text-orange-400',
      icon: TrendingDown,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className={`bg-gradient-to-br ${stat.bgGradient} ${stat.borderColor} hover:border-opacity-50 transition-all duration-300`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-lg ${stat.textColor}`}>
                  {stat.label}
                </CardTitle>
                <Icon className={stat.textColor} size={24} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" style={{ color: 'inherit' }}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
