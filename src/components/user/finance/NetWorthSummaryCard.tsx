'use client';

import { Card } from '@/components/ui/card';
import { NetWorthSummary } from '@/hooks/useUserFinance';

interface NetWorthSummaryCardProps {
  data: NetWorthSummary | null;
  loading?: boolean;
}

export default function NetWorthSummaryCard({
  data,
  loading = false,
}: NetWorthSummaryCardProps) {
  if (loading || !data) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-6 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const { summary } = data;
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const netWorthColor =
    summary.netWorth >= 0
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-destructive';

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 backdrop-blur-sm">
      <h2 className="text-2xl font-bold mb-6 text-white">Net Worth Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Assets */}
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/30 rounded-lg p-4 shadow-sm border border-blue-400/30">
          <p className="text-sm font-medium text-gray-300">Total Assets</p>
          <p className="text-2xl font-bold text-blue-400 mt-2">
            {formatCurrency(summary.totalAssets)}
          </p>
        </div>

        {/* Total Liabilities */}
        <div className="bg-gradient-to-br from-red-900/30 to-red-950/30 rounded-lg p-4 shadow-sm border border-red-400/30">
          <p className="text-sm font-medium text-gray-300">Total Liabilities</p>
          <p className="text-2xl font-bold text-red-400 mt-2">
            {formatCurrency(summary.totalLiabilities)}
          </p>
        </div>

        {/* Net Worth */}
        <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-950/30 rounded-lg p-4 shadow-sm border border-emerald-400/30">
          <p className="text-sm font-medium text-gray-300">Net Worth</p>
          <p className={`text-2xl font-bold ${netWorthColor} mt-2`}>
            {formatCurrency(summary.netWorth)}
          </p>
        </div>

        {/* Monthly Savings */}
        <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-950/30 rounded-lg p-4 shadow-sm border border-cyan-400/30">
          <p className="text-sm font-medium text-gray-300">Monthly Savings</p>
          <p
            className={`text-2xl font-bold ${summary.monthlySavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'} mt-2`}
          >
            {formatCurrency(summary.monthlySavings)}
          </p>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-950/30 rounded-lg p-4 shadow-sm border border-emerald-400/30">
          <p className="text-sm font-medium text-gray-300">Monthly Income</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(summary.monthlyIncome)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-900/30 to-red-950/30 rounded-lg p-4 shadow-sm border border-red-400/30">
          <p className="text-sm font-medium text-gray-300">Monthly Expenses</p>
          <p className="text-xl font-bold text-red-400 mt-2">
            {formatCurrency(summary.monthlyExpenses)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/30 rounded-lg p-4 shadow-sm border border-blue-400/30">
          <p className="text-sm font-medium text-gray-300">Interest Earned</p>
          <p className="text-xl font-bold text-blue-400 mt-2">
            {formatCurrency(summary.totalInterestEarned)}
          </p>
        </div>
      </div>

      {/* FIRE & Debt Free */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-gradient-to-br from-violet-900/30 to-violet-950/30 rounded-lg p-4 shadow-sm border border-violet-400/30">
          <p className="text-sm font-medium text-gray-300">FIRE Corpus (25x)</p>
          <p className="text-xl font-bold text-violet-300 mt-2">
            {formatCurrency(summary.fireCorpus)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-fuchsia-900/30 to-fuchsia-950/30 rounded-lg p-4 shadow-sm border border-fuchsia-400/30">
          <p className="text-sm font-medium text-gray-300">
            FIRE Corpus (Inflation adj.)
          </p>
          <p className="text-xl font-bold text-fuchsia-300 mt-2">
            {formatCurrency(summary.fireCorpusInflationAdjusted)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-900/30 to-orange-950/30 rounded-lg p-4 shadow-sm border border-orange-400/30">
          <p className="text-sm font-medium text-gray-300">Debt-Free Date</p>
          <p className="text-xl font-bold text-orange-300 mt-2">
            {summary.debtFreeDate
              ? new Date(summary.debtFreeDate).toLocaleDateString('en-IN')
              : 'N/A'}
          </p>
        </div>
      </div>
    </Card>
  );
}
