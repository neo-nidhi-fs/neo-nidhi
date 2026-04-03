'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CashFlow } from '@/hooks/useUserFinance';
import {
  Trash2,
  Edit2,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface CashFlowManagerProps {
  cashflows: CashFlow[];
  loading?: boolean;
  onEdit?: (cashflow: CashFlow) => void;
  onDelete?: (cashflowId: string) => void;
  onAddClick?: () => void;
}

function CashFlowSummaryBar({
  formatCurrency,
  totalIncome,
  totalExpense,
  totalRemaining,
}: {
  formatCurrency: (value: number) => string;
  totalIncome: number;
  totalExpense: number;
  totalRemaining: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg bg-slate-900/60 border border-slate-600/80 p-4">
      <div className="text-center sm:text-left">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          Total income
        </p>
        <p className="text-lg font-semibold text-emerald-400">
          {formatCurrency(totalIncome)}
        </p>
      </div>
      <div className="text-center sm:text-left">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          Total expense
        </p>
        <p className="text-lg font-semibold text-red-400">
          {formatCurrency(totalExpense)}
        </p>
      </div>
      <div className="text-center sm:text-left">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          Remaining
        </p>
        <p
          className={`text-lg font-semibold ${totalRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
        >
          {formatCurrency(totalRemaining)}
        </p>
      </div>
    </div>
  );
}

export default function CashFlowManager({
  cashflows,
  loading = false,
  onEdit,
  onDelete,
  onAddClick,
}: CashFlowManagerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const monthLabel = (date: Date) =>
    date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const visibleCashflows = [...cashflows]
    .filter((cashflow) => {
      const cfDate = new Date(cashflow.date);
      return (
        cfDate.getFullYear() === currentMonth.getFullYear() &&
        cfDate.getMonth() === currentMonth.getMonth()
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = visibleCashflows
    .filter((cf) => cf.type === 'income')
    .reduce((sum, cf) => sum + cf.amount, 0);

  const totalExpense = visibleCashflows
    .filter((cf) => cf.type === 'expense')
    .reduce((sum, cf) => sum + cf.amount, 0);

  const totalRemaining = totalIncome - totalExpense;

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const sortedCashflows = visibleCashflows;

  const now = new Date();
  const isViewingCurrentMonth =
    currentMonth.getFullYear() === now.getFullYear() &&
    currentMonth.getMonth() === now.getMonth();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 backdrop-blur-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-4">
        <h3 className="text-xl font-bold text-white">Income & Expenses</h3>
        <Button
          onClick={onAddClick}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
        >
          + Add Entry
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 border-b border-slate-600">
        <div className="flex items-center justify-center sm:justify-start gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-lg text-white hover:bg-slate-700/80 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="min-w-[12rem] text-center text-lg font-semibold text-white tabular-nums">
            {monthLabel(currentMonth)}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-lg text-white hover:bg-slate-700/80 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
        {!isViewingCurrentMonth && (
          <Button
            type="button"
            variant="outline"
            onClick={handleToday}
            className="border-slate-500 text-slate-200 hover:bg-slate-700 self-center sm:self-auto"
          >
            This month
          </Button>
        )}
      </div>

      <div className="mb-6">
        <CashFlowSummaryBar
          formatCurrency={formatCurrency}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          totalRemaining={totalRemaining}
        />
      </div>

      {sortedCashflows.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-300">
            No income or expense entries for {monthLabel(currentMonth)}.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 px-4 font-semibold text-white">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white">
                  Type
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white">
                  Category
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white">
                  Source
                </th>
                <th className="text-right py-3 px-4 font-semibold text-white">
                  Amount
                </th>
                <th className="text-right py-3 px-4 font-semibold text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCashflows.map((cashflow) => (
                <tr
                  key={cashflow._id}
                  className="border-b border-slate-600 hover:bg-slate-700/30 transition-colors"
                >
                  <td className="py-4 px-4 text-gray-200">
                    {new Date(cashflow.date).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {cashflow.type === 'income' ? (
                        <>
                          <TrendingUp
                            size={18}
                            className="text-emerald-600 dark:text-emerald-400"
                          />
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300">
                            Income
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown
                            size={18}
                            className="text-destructive"
                          />
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-300">
                            Expense
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-200">
                    {cashflow.category}
                  </td>
                  <td className="py-4 px-4 text-gray-200">{cashflow.source}</td>
                  <td
                    className={`py-4 px-4 text-right font-semibold ${cashflow.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}
                  >
                    {cashflow.type === 'income' ? '+' : '-'}
                    {formatCurrency(cashflow.amount)}
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button
                      onClick={() => onEdit && onEdit(cashflow)}
                      className="inline-flex items-center px-2 py-1 text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(cashflow._id)}
                      className="inline-flex items-center px-2 py-1 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
