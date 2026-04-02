'use client';

import { useState } from 'react';
import { CashFlow, Liability } from '@/hooks/useUserFinance';
import { X } from 'lucide-react';

interface CashFlowFormData {
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  source: string;
  liabilityId?: string;
  note?: string;
}

interface CashFlowFormProps {
  cashflow?: CashFlow;
  liabilities?: Liability[];
  onSubmit: (data: CashFlowFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const INCOME_CATEGORIES = [
  'Salary',
  'Bonus',
  'Freelance',
  'Investment Returns',
  'Interest',
  'Dividends',
  'Rental Income',
  'Other Income',
];

const EXPENSE_CATEGORIES = [
  'Groceries',
  'Utilities',
  'Rent',
  'Transportation',
  'Healthcare',
  'Entertainment',
  'Dining',
  'Shopping',
  'Insurance',
  'EMI/Loan',
  'Other Expense',
];

export default function CashFlowForm({
  cashflow,
  liabilities = [],
  onSubmit,
  onCancel,
  loading = false,
}: CashFlowFormProps) {
  const [formData, setFormData] = useState({
    date: cashflow?.date
      ? cashflow.date.split('T')[0]
      : new Date().toISOString().split('T')[0],
    type: (cashflow?.type as 'income' | 'expense') || 'income',
    category: cashflow?.category || '',
    amount: cashflow?.amount || 0,
    source: cashflow?.source || '',
    liabilityId: cashflow?.liabilityId || '',
    note: cashflow?.note || '',
  });

  const categories =
    formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.date ||
      !formData.type ||
      !formData.category ||
      formData.amount <= 0 ||
      !formData.source
    ) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-lg shadow-xl max-w-md w-full border border-slate-700 backdrop-blur-sm">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-600">
          <h2 className="text-xl font-bold text-white">
            {cashflow ? 'Edit Entry' : 'Add Income/Expense'}
          </h2>
          <button onClick={onCancel} className="text-gray-300 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Type *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'income' | 'expense',
                      category: '',
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-300">Income</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'income' | 'expense',
                      category: '',
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-300">Expense</span>
              </label>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Amount (₹) *
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
              className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0"
              step="0.01"
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Source/Description *
            </label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) =>
                setFormData({ ...formData, source: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Amazon, Client XYZ, Coffee Shop"
            />
          </div>

          {/* Loan tie-in for loan payments */}
          {formData.type === 'expense' && liabilities?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Apply to Loan (optional)
              </label>
              <select
                value={formData.liabilityId || ''}
                onChange={(e) =>
                  setFormData({ ...formData, liabilityId: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">No linked liability</option>
                {liabilities.map((liability) => (
                  <option key={liability._id} value={liability._id}>
                    {liability.type} - Outstanding: ₹{liability.amount}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Note
            </label>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Optional note"
              rows={2}
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
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}
