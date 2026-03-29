'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Liability } from '@/hooks/useUserFinance';
import { Trash2, Edit2 } from 'lucide-react';

interface LiabilityManagerProps {
  liabilities: Liability[];
  loading?: boolean;
  onEdit?: (liability: Liability) => void;
  onDelete?: (liabilityId: string) => void;
  onAddClick?: () => void;
}

export default function LiabilityManager({
  liabilities,
  loading = false,
  onEdit,
  onDelete,
  onAddClick,
}: LiabilityManagerProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      active: 'bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-300',
      paid_off:
        'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300',
      closed:
        'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-200',
    };
    return (
      colors[status] ||
      'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-200'
    );
  };

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
        <h3 className="text-xl font-bold text-white">Liabilities</h3>
        <Button
          onClick={onAddClick}
          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
        >
          + Add Liability
        </Button>
      </div>

      {liabilities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-300">No liabilities recorded.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 px-4 font-semibold text-white">
                  Type
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white">
                  Amount
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white">
                  Interest Rate
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white">
                  Due Date
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white">
                  Status
                </th>
                <th className="text-right py-3 px-4 font-semibold text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {liabilities.map((liability) => (
                <tr
                  key={liability._id}
                  className="border-b border-slate-600 hover:bg-slate-700/30 transition-colors"
                >
                  <td className="py-4 px-4 text-gray-200 font-medium">
                    {liability.type}
                  </td>
                  <td className="py-4 px-4 font-semibold text-white">
                    {formatCurrency(liability.amount)}
                  </td>
                  <td className="py-4 px-4 text-gray-200">
                    {liability.interestRate
                      ? `${liability.interestRate.toFixed(2)}% p.a.`
                      : '-'}
                  </td>
                  <td className="py-4 px-4 text-gray-200">
                    {liability.dueDate
                      ? new Date(liability.dueDate).toLocaleDateString('en-IN')
                      : '-'}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(liability.status)}`}
                    >
                      {liability.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button
                      onClick={() => onEdit && onEdit(liability)}
                      className="inline-flex items-center px-2 py-1 text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(liability._id)}
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
