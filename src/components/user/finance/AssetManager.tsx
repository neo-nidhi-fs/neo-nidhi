'use client';

import { useState } from 'react';
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
      etf: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-300',
      gold: 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300',
      silver:
        'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-200',
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

  const getAssetTotalValue = (asset: Asset): number => {
    // If quantity is provided, marketValue is treated as per-unit price for portability
    if (
      asset.quantity &&
      asset.quantity > 0 &&
      asset.marketValue &&
      asset.marketValue >= 0
    ) {
      return asset.marketValue * asset.quantity;
    }

    // Fallback: if marketValue is a total value already
    if (asset.marketValue && asset.marketValue > 0) {
      return asset.marketValue;
    }

    // If only amount (invested money) is available
    if (
      asset.quantity &&
      asset.quantity > 0 &&
      asset.amount &&
      asset.amount > 0
    ) {
      const unitPrice = asset.amount / asset.quantity;
      return unitPrice * asset.quantity;
    }

    return asset.amount || 0;
  };

  const categoryGroups = assets?.reduce(
    (acc, asset) => {
      const categoryKey = asset.category?.trim() || 'Uncategorized';
      if (!acc[categoryKey]) {
        acc[categoryKey] = { totalValue: 0, assets: [] as Asset[] };
      }
      acc[categoryKey].totalValue += getAssetTotalValue(asset);
      acc[categoryKey].assets.push(asset);
      return acc;
    },
    {} as Record<string, { totalValue: number; assets: Asset[] }>
  );

  const selectedAssets = selectedCategory
    ? categoryGroups?.[selectedCategory]?.assets || []
    : [];

  const isCategoryView = !selectedCategory;

  return (
    <Card className="p-6 bg-gradient-to-br from-emerald-900/50 via-slate-800/80 to-slate-900/80 border-emerald-500/30 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">
            {isCategoryView
              ? 'Asset Categories'
              : `Assets in ${selectedCategory}`}
          </h3>
          {!isCategoryView && (
            <p className="text-sm text-gray-400">
              {selectedAssets.length} asset(s), total value{' '}
              {formatCurrency(
                categoryGroups?.[selectedCategory || '']?.totalValue || 0
              )}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {!isCategoryView && (
            <Button
              onClick={() => setSelectedCategory(null)}
              className="bg-slate-600 hover:bg-slate-500 text-white"
            >
              ← Back to Categories
            </Button>
          )}
          <Button
            onClick={onAddClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            + Add Asset
          </Button>
        </div>
      </div>

      {assets?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-300">
            No assets yet. Add your first asset to get started.
          </p>
        </div>
      ) : isCategoryView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categoryGroups || {}).map(([categoryKey, group]) => (
            <div
              key={categoryKey}
              className="p-4 bg-slate-800/70 border border-slate-700 rounded-xl shadow-xl hover:-translate-y-1 transition-transform cursor-pointer"
              onClick={() => setSelectedCategory(categoryKey)}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">
                  {categoryKey}
                </h4>
                <span className="text-xs text-gray-400">
                  {group.assets.length} item(s)
                </span>
              </div>
              <p className="text-sm text-gray-300 mt-3">
                Total Value: {formatCurrency(group.totalValue)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedAssets.map((asset) => (
            <div
              key={asset._id}
              className="p-4 bg-slate-800/70 border border-emerald-500/40 rounded-xl shadow-xl hover:-translate-y-1 transition-transform"
            >
              <div className="flex items-start justify-between mb-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(asset.type)}`}
                >
                  {asset.type.replace('_', ' ')}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit && onEdit(asset)}
                    className="p-1 text-blue-400 hover:text-blue-200 rounded"
                    aria-label="Edit asset"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(asset._id)}
                    className="p-1 text-red-400 hover:text-red-200 rounded"
                    aria-label="Delete asset"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h4 className="text-lg font-semibold text-white">
                {asset.type === 'equity' && asset.symbolOrCode
                  ? `${asset.symbolOrCode.toUpperCase()} - ${asset.category || 'Equity'}`
                  : asset.category || 'Unnamed'}
              </h4>
              {asset.type === 'equity' &&
                asset.symbolOrCode &&
                asset.category && (
                  <p className="text-xs text-gray-400 mt-1">
                    Company: {asset.category}
                  </p>
                )}
              <p className="text-sm text-gray-300 mt-1 break-words">
                Qty: {asset.quantity ? `${asset.quantity}` : '-'}
              </p>
              <p className="text-sm text-gray-300">
                Invested: {formatCurrency(asset.amount)}
              </p>
              <p className="text-sm text-gray-200">
                Total Value: {formatCurrency(getAssetTotalValue(asset))}
              </p>

              <div className="mt-3 bg-slate-900/80 rounded-lg p-3">
                <p className="text-xs text-gray-400">Current Value</p>
                <p className="text-xl font-bold text-cyan-300">
                  {formatCurrency(asset.marketValue)}
                </p>
                <p className="text-xs text-gray-400 mt-1">Return</p>
                {(() => {
                  const basis = asset.purchaseValue ?? asset.amount ?? 0;
                  const gainLoss = asset.marketValue - basis;
                  const pct = basis > 0 ? (gainLoss / basis) * 100 : 0;
                  const isPositive = gainLoss >= 0;
                  return (
                    <p
                      className={`text-sm font-semibold ${
                        isPositive ? 'text-emerald-300' : 'text-rose-300'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {formatCurrency(gainLoss)} ({pct.toFixed(2)}%)
                    </p>
                  );
                })()}
              </div>

              {asset.purchaseValue ? (
                <p className="mt-2 text-xs text-gray-200">
                  Purchase: {formatCurrency(asset.purchaseValue)}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
