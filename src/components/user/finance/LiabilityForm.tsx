'use client';

import { useState } from 'react';
import { Liability } from '@/hooks/useUserFinance';
import { X } from 'lucide-react';

interface LiabilityFormData {
  type: string;
  amount: number;
  interestRate?: number;
  dueDate?: string;
  status: Liability['status'];
  metadata?: Record<string, string | number | boolean>;
}

interface LiabilityFormProps {
  liability?: Liability;
  onSubmit: (data: LiabilityFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function LiabilityForm({
  liability,
  onSubmit,
  onCancel,
  loading = false,
}: LiabilityFormProps) {
  const [formData, setFormData] = useState({
    type: liability?.type || '',
    amount: liability?.amount || 0,
    interestRate: liability?.interestRate || 0,
    dueDate: liability?.dueDate || '',
    status: liability?.status || 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || formData.amount <= 0) {
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
            {liability ? 'Edit Liability' : 'Add Liability'}
          </h2>
          <button onClick={onCancel} className="text-gray-300 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Liability Type *
            </label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="e.g., Personal Loan, Credit Card Debt, Home Loan"
            />
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
              className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="0"
              step="0.01"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Interest Rate (% p.a.)
            </label>
            <input
              type="number"
              value={formData.interestRate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  interestRate: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="0"
              step="0.01"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Liability['status'],
                })
              }
              className="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="active">Active</option>
              <option value="paid_off">Paid Off</option>
              <option value="closed">Closed</option>
            </select>
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
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Liability'}
          </button>
        </div>
      </div>
    </div>
  );
}
