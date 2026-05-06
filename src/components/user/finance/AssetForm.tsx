'use client';

import { useState } from 'react';
import { Asset } from '@/hooks/useUserFinance';
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
  maturityDate?: string;
  rateOfInterest?: number;
  investmentMode?: 'monthly' | 'quarterly' | 'yearly';
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
    type: asset?.type || 'fd',
    category: asset?.category || '',
    amount: asset?.amount || 0,
    quantity: asset?.quantity || 0,
    purchaseValue: asset?.purchaseValue || 0,
    marketValue: asset?.marketValue || 0,
    symbolOrCode: asset?.symbolOrCode || '',
    startDate: asset?.startDate || '',
    maturityDate: asset?.maturityDate || '',
    rateOfInterest: asset?.rateOfInterest || 0,
    investmentMode: asset?.investmentMode || 'monthly',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isRecurringDeposit = formData.type === 'rd';
  const isFixedDeposit = formData.type === 'fd';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-lg shadow-xl max-w-md w-full border border-slate-700 backdrop-blur-sm overflow-auto min-h-[90vh] max-h-[95vh]">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
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
              <option value="etf">ETF</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="epfo">EPFO</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* RD/FD Specific Fields */}
          {(isRecurringDeposit || isFixedDeposit) && (
            <>
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Maturity Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Maturity Date *
                </label>
                <input
                  type="date"
                  value={formData.maturityDate}
                  onChange={(e) =>
                    setFormData({ ...formData, maturityDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Rate of Interest */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Rate of Interest (% per annum) *
                </label>
                <input
                  type="text"
                  pattern="^\d*\.?\d*$"
                  value={formData.rateOfInterest}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rateOfInterest: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 7.5"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </>
          )}

          {/* RD Specific: Investment Mode */}
          {isRecurringDeposit && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Investment Mode *
              </label>
              <select
                value={formData.investmentMode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    investmentMode: e.target.value as
                      | 'monthly'
                      | 'quarterly'
                      | 'yearly',
                  })
                }
                className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}

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
              placeholder="e.g., SBI RD, HDFC FD"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {isRecurringDeposit
                ? 'Monthly Installment Amount (₹) *'
                : 'Amount Invested (?)'}
            </label>
            <input
              type="text"
              pattern="^\d*\.?\d*$"
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
              required
            />
          </div>

          {/* Market Value */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Current Market Value (?)
            </label>
            <input
              type="text"
              pattern="^\d*\.?\d*$"
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

