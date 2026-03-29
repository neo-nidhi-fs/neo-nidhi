'use client';

import { useState } from 'react';
import { Asset } from '@/hooks/useUserFinance';
import { useQuotes } from '@/hooks/useQuotes';
import { X } from 'lucide-react';

interface AssetFormData {
  type: Asset['type'];
  category: string;
  amount: number;
  quantity?: number;
  purchaseValue?: number;
  marketValue: number;
  symbolOrCode?: string;
  startDate?: string;
}

interface AssetFormProps {
  asset?: Asset;
  onSubmit: (data: AssetFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function AssetForm({
  asset,
  onSubmit,
  onCancel,
  loading = false,
}: AssetFormProps) {
  const [formData, setFormData] = useState({
    type: asset?.type || 'equity',
    category: asset?.category || '',
    amount: asset?.amount || 0,
    quantity: asset?.quantity || 0,
    purchaseValue: asset?.purchaseValue || 0,
    marketValue: asset?.marketValue || 0,
    symbolOrCode: asset?.symbolOrCode || '',
    startDate: asset?.startDate || '',
  });

  const {
    fetchStockQuotes,
    fetchMutualFundQuotes,
    stockQuotes,
    mutualFundQuotes,
  } = useQuotes();

  const handleSymbolChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const symbol = e.target.value.toUpperCase();
    setFormData({ ...formData, symbolOrCode: symbol });

    if (symbol && symbol.length > 0) {
      if (formData.type === 'equity') {
        await fetchStockQuotes([symbol]);
      } else if (formData.type === 'mutual_fund') {
        await fetchMutualFundQuotes([symbol]);
      }
    }
  };

  const getQuoteValue = () => {
    if (formData.type === 'equity' && formData.symbolOrCode) {
      return stockQuotes[formData.symbolOrCode]?.price || null;
    } else if (formData.type === 'mutual_fund' && formData.symbolOrCode) {
      return mutualFundQuotes[formData.symbolOrCode]?.nav || null;
    }
    return null;
  };

  const handleApplyQuote = () => {
    const quoteValue = getQuoteValue();
    if (quoteValue && formData.quantity) {
      setFormData({
        ...formData,
        marketValue: quoteValue * formData.quantity,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const quoteValue = getQuoteValue();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-lg shadow-xl max-w-md w-full border border-slate-700 backdrop-blur-sm">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-600">
          <h2 className="text-xl font-bold text-white">
            {asset ? 'Edit Asset' : 'Add Asset'}
          </h2>
          <button onClick={onCancel} className="text-gray-300 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-96 overflow-y-auto"
        >
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Asset Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as Asset['type'],
                })
              }
              className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fd">Fixed Deposit</option>
              <option value="rd">Recurring Deposit</option>
              <option value="equity">Equity</option>
              <option value="mutual_fund">Mutual Fund</option>
              <option value="epfo">EPFO</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Stocks, Growth Funds"
            />
          </div>

          {/* Symbol or Code */}
          {(formData.type === 'equity' || formData.type === 'mutual_fund') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {formData.type === 'equity' ? 'Stock Symbol' : 'Fund Code'}
              </label>
              <input
                type="text"
                value={formData.symbolOrCode}
                onChange={handleSymbolChange}
                className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder={
                  formData.type === 'equity' ? 'e.g., TCS' : 'e.g., DSP-EQUITY'
                }
              />
              {quoteValue && (
                <div className="mt-2 p-2 bg-blue-900/30 rounded border border-blue-400/30">
                  <p className="text-sm text-blue-300">
                    Current Price: ₹{quoteValue}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quantity */}
          {(formData.type === 'equity' || formData.type === 'mutual_fund') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Quantity/Units
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                step="0.01"
              />
            </div>
          )}

          {/* Purchase Value */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Purchase Value (₹)
            </label>
            <input
              type="number"
              value={formData.purchaseValue}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  purchaseValue: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              step="0.01"
            />
          </div>

          {/* Market Value */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Current Market Value (₹)
            </label>
            <input
              type="number"
              value={formData.marketValue}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  marketValue: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              step="0.01"
            />
            {quoteValue && formData.quantity && (
              <button
                type="button"
                onClick={handleApplyQuote}
                className="mt-2 text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                Apply Quote (₹{(quoteValue * formData.quantity).toFixed(2)})
              </button>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Amount Invested (₹)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              step="0.01"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-600">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-slate-600 rounded-md text-gray-300 hover:bg-slate-700/50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Asset'}
          </button>
        </div>
      </div>
    </div>
  );
}
