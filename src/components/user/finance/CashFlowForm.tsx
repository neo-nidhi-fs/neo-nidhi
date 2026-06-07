'use client';

import { useState } from 'react';
import {
  CashFlow,
  ExpensePaymentSource,
  Liability,
} from '@/hooks/useUserFinance';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/financeCategories';
import { X } from 'lucide-react';

interface CashFlowFormData {
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  source: string;
  /** Required for both income and expense */
  paymentSource: ExpensePaymentSource;
  liabilityId?: string;
  note?: string;
}

function evaluateAmountExpression(input: string): number | null {
  const normalized = input.replace(/\s+/g, '');
  if (!normalized) return null;

  if (!/^[0-9.+-]+$/.test(normalized)) return null;
  if (!/[+-]/.test(normalized)) {
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  const tokens = normalized.match(/[+-]?\d*\.?\d+/g);
  if (!tokens) return null;

  const reconstructed = tokens.join('');
  if (reconstructed !== normalized) return null;

  const total = tokens.reduce((sum, token) => sum + Number(token), 0);
  return Number.isFinite(total) ? total : null;
}

function emptyFormState(): CashFlowFormData {
  return {
    date: new Date().toISOString().split('T')[0],
    type: 'income',
    category: '',
    amount: 0,
    source: '',
    paymentSource: 'account',
    liabilityId: '',
    note: '',
  };
}

interface CashFlowFormProps {
  cashflow?: CashFlow;
  liabilities?: Liability[];
  /** Return true after a successful add so the form resets for another entry. */
  onSubmit: (data: CashFlowFormData) => void | Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export default function CashFlowForm({
  cashflow,
  liabilities = [],
  onSubmit,
  onCancel,
  loading = false,
}: CashFlowFormProps) {
  const initialFormData = cashflow
    ? {
        date: cashflow.date.split('T')[0],
        type: (cashflow.type as 'income' | 'expense') || 'income',
        category: cashflow.category || '',
        amount: cashflow.amount || 0,
        source: cashflow.source || '',
        paymentSource:
          (cashflow.paymentSource === 'credit_card'
            ? 'card'
            : cashflow.paymentSource) || ('account' as ExpensePaymentSource),
        liabilityId: cashflow.liabilityId || '',
        note: cashflow.note || '',
      }
    : emptyFormState();

  const [formData, setFormData] = useState(initialFormData);
  const [amountInput, setAmountInput] = useState(
    String(initialFormData.amount || '')
  );

  const categories =
    formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    const evaluatedAmount = evaluateAmountExpression(amountInput);
    const finalAmount = evaluatedAmount ?? formData.amount;

    if (
      !formData.date ||
      !formData.type ||
      !formData.category ||
      finalAmount <= 0 ||
      !formData.source ||
      !formData.paymentSource
    ) {
      alert('Please fill in all required fields');
      return;
    }
    const payload = { ...formData, amount: finalAmount };
    const result = await onSubmit(payload);
    if (result === true && !cashflow) {
      setFormData(emptyFormState());
      setAmountInput('');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-lg shadow-xl max-w-md w-full border border-slate-700 backdrop-blur-sm overflow-auto max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cashflow-form-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-600">
          <h2 id="cashflow-form-title" className="text-xl font-bold text-white">
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
                      paymentSource: 'account',
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
                      paymentSource: 'account',
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {formData.type === 'income' ? 'Received in *' : 'Paid from *'}
            </label>
            <select
              value={formData.paymentSource}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentSource: e.target.value as ExpensePaymentSource,
                })
              }
              className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="account">Account</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Amount (₹) *
            </label>
            <input
              type="text"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              onBlur={() => {
                const evaluated = evaluateAmountExpression(amountInput);
                if (evaluated === null) return;
                setFormData((prev) => ({ ...prev, amount: evaluated }));
                setAmountInput(String(evaluated));
              }}
              className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0 or 200+150-50"
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
          {formData.type === 'expense' && (
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
                disabled={liabilities.length === 0}
              >
                <option value="">
                  {liabilities.length === 0
                    ? 'No liabilities available'
                    : 'No linked liability'}
                </option>
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
              rows={4}
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
