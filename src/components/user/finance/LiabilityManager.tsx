'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Liability } from '@/hooks/useUserFinance';
import { Trash2, Edit2 } from 'lucide-react';

interface LiabilityManagerProps {
  liabilities: Liability[];
  loading?: boolean;
  onEdit?: (liability: Liability) => void;
  onDelete?: (liabilityId: string) => void;
  onRepay?: (liabilityId: string) => void;
  onClose?: (liabilityId: string) => void;
  onAddClick?: () => void;
}

export default function LiabilityManager({
  liabilities,
  loading = false,
  onEdit,
  onDelete,
  onRepay,
  onClose,
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

  const [selectedType, setSelectedType] = useState<string | null>(null);

  const typeGroups = liabilities?.reduce(
    (acc, liability) => {
      const categoryKey = liability.type?.trim() || 'Uncategorized';
      if (!acc[categoryKey]) {
        acc[categoryKey] = {
          totalOutstanding: 0,
          liabilities: [] as Liability[],
        };
      }
      const outstanding = liability.projection?.outstanding ?? liability.amount;
      acc[categoryKey].totalOutstanding += outstanding;
      acc[categoryKey].liabilities.push(liability);
      return acc;
    },
    {} as Record<string, { totalOutstanding: number; liabilities: Liability[] }>
  );

  const selectedLiabilities = selectedType
    ? typeGroups?.[selectedType]?.liabilities || []
    : [];

  const isTypeView = !selectedType;

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
      ) : isTypeView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(typeGroups || {}).map(([type, group]) => (
            <div
              key={type}
              className="p-4 bg-slate-800/70 border border-red-500/30 rounded-xl shadow-xl hover:-translate-y-1 transition-transform cursor-pointer"
              onClick={() => setSelectedType(type)}
            >
              <h4 className="text-lg font-semibold text-white">{type}</h4>
              <p className="text-xs text-gray-400">
                {group.liabilities.length} liability(ies)
              </p>
              <p className="mt-2 text-sm text-red-300 font-semibold">
                Outstanding: {formatCurrency(group.totalOutstanding)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-300">
              {selectedLiabilities.length} liability(ies) in category{' '}
              <strong className="text-white">{selectedType}</strong>
            </p>
            <p className="text-sm text-gray-400">
              Total outstanding:{' '}
              {formatCurrency(
                typeGroups?.[selectedType || '']?.totalOutstanding || 0
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedLiabilities.map((liability) => (
              <div
                key={liability._id}
                className="p-4 bg-slate-800/70 border border-slate-700 rounded-xl shadow-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">
                    {liability.type}
                  </span>
                  <span className="text-xs text-gray-300">
                    {liability.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-white font-bold text-lg">
                  {formatCurrency(liability.amount)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Due:{' '}
                  {liability.dueDate
                    ? new Date(liability.dueDate).toLocaleDateString('en-IN')
                    : '-'}
                </p>
                <p className="text-xs text-gray-400">
                  Rate:{' '}
                  {liability.interestRate
                    ? `${liability.interestRate.toFixed(2)}%`
                    : '-'}
                </p>
                <p className="text-sm text-red-200 mt-2">
                  Outstanding:{' '}
                  {formatCurrency(
                    liability.projection?.outstanding || liability.amount
                  )}
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => onEdit && onEdit(liability)}
                    className="flex-1 px-2 py-1 text-blue-400 bg-blue-900/20 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(liability._id)}
                    className="flex-1 px-2 py-1 text-red-400 bg-red-900/20 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Button
              onClick={() => setSelectedType(null)}
              className="bg-slate-600 hover:bg-slate-500 text-white"
            >
              ← Back to Liability Types
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
