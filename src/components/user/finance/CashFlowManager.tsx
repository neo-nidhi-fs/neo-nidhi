'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CashFlow } from '@/hooks/useUserFinance';
import { Trash2, Edit2, TrendingUp, TrendingDown } from 'lucide-react';

interface CashFlowManagerProps {
  cashflows: CashFlow[];
  loading?: boolean;
  onEdit?: (cashflow: CashFlow) => void;
  onDelete?: (cashflowId: string) => void;
  onAddClick?: () => void;
}

export default function CashFlowManager({
  cashflows,
  loading = false,
  onEdit,
  onDelete,
  onAddClick,
}: CashFlowManagerProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const sortedCashflows = [...cashflows].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Income & Expenses</h3>
        <Button
          onClick={onAddClick}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          + Add Entry
        </Button>
      </div>

      {sortedCashflows.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-300">No income or expense entries yet.</p>
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
