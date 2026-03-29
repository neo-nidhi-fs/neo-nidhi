'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Asset } from '@/hooks/useUserFinance';
import { Trash2, Edit2 } from 'lucide-react';

interface AssetManagerProps {
  assets: Asset[];
  loading?: boolean;
  onEdit?: (asset: Asset) => void;
  onDelete?: (assetId: string) => void;
  onAddClick?: () => void;
}

export default function AssetManager({
  assets,
  loading = false,
  onEdit,
  onDelete,
  onAddClick,
}: AssetManagerProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      fd: 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300',
      rd: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-300',
      equity:
        'bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-300',
      mutual_fund:
        'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300',
      epfo: 'bg-teal-100 text-teal-900 dark:bg-teal-900/30 dark:text-teal-300',
      other:
        'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-200',
    };
    return (
      colors[type] ||
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
        <h3 className="text-xl font-bold text-white">Assets</h3>
        <Button
          onClick={onAddClick}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          + Add Asset
        </Button>
      </div>

      {assets?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-300">
            No assets yet. Add your first asset to get started.
          </p>
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
                  Category
                </th>
                <th className="text-left py-3 px-4 font-semibold text-white">
                  Quantity
                </th>
                <th className="text-right py-3 px-4 font-semibold text-white">
                  Value
                </th>
                <th className="text-right py-3 px-4 font-semibold text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {assets?.map((asset) => (
                <tr
                  key={asset._id}
                  className="border-b border-slate-600 hover:bg-slate-700/30 transition-colors"
                >
                  <td className="py-4 px-4 text-gray-200">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(asset.type)}`}
                    >
                      {asset.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-200">{asset.category}</td>
                  <td className="py-4 px-4 text-gray-200">
                    {asset.quantity ? `${asset.quantity} units` : '-'}
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-white">
                    {formatCurrency(asset.marketValue)}
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button
                      onClick={() => onEdit && onEdit(asset)}
                      className="inline-flex items-center px-2 py-1 text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(asset._id)}
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
