'use client';

import { useState } from 'react';
import type {
  IRDScheme,
  ICreateSchemeRequest,
} from '@/lib/services/rdNewService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: ICreateSchemeRequest) => Promise<boolean>;
  initial?: IRDScheme | null;
}

export default function RDSchemeDialog({
  open,
  onClose,
  onSave,
  initial,
}: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [interestRate, setInterestRate] = useState(
    String(initial?.interestRate ?? '')
  );
  const [tenureMonths, setTenureMonths] = useState(
    String(initial?.tenureMonths ?? '')
  );
  const [minMonthlyAmount, setMinMonthlyAmount] = useState(
    String(initial?.minMonthlyAmount ?? '')
  );
  const [maxMonthlyAmount, setMaxMonthlyAmount] = useState(
    initial?.maxMonthlyAmount != null ? String(initial.maxMonthlyAmount) : ''
  );
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [allowAutoDebit, setAllowAutoDebit] = useState(
    initial?.allowAutoDebit !== false
  );
  const [allowOneTimeInvestment, setAllowOneTimeInvestment] = useState(
    initial?.allowOneTimeInvestment ?? false
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const ok = await onSave({
      name: name.trim(),
      description: description.trim(),
      interestRate: Number(interestRate),
      tenureMonths: Number(tenureMonths),
      minMonthlyAmount: Number(minMonthlyAmount),
      maxMonthlyAmount:
        maxMonthlyAmount !== '' ? Number(maxMonthlyAmount) : null,
      isActive,
      allowAutoDebit,
      allowOneTimeInvestment,
    });
    setSaving(false);
    if (ok) {
      onClose();
    } else {
      setError('Failed to save scheme. Check inputs and try again.');
    }
  }

  const inputCls =
    'w-full border border-slate-600 bg-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">
            {initial ? 'Edit RD Scheme' : 'New RD Scheme'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Scheme Name *
            </label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Monthly Saver Gold"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Description
            </label>
            <input
              className={inputCls}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Interest Rate (% p.a.) *
              </label>
              <input
                className={inputCls}
                type="number"
                min="0"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                required
                placeholder="7.5"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Tenure (months) *
              </label>
              <input
                className={inputCls}
                type="number"
                min="1"
                step="1"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(e.target.value)}
                required
                placeholder="12"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Min Monthly Amount (₹) *
              </label>
              <input
                className={inputCls}
                type="number"
                min="1"
                step="1"
                value={minMonthlyAmount}
                onChange={(e) => setMinMonthlyAmount(e.target.value)}
                required
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Max Monthly Amount (₹)
              </label>
              <input
                className={inputCls}
                type="number"
                min="1"
                step="1"
                value={maxMonthlyAmount}
                onChange={(e) => setMaxMonthlyAmount(e.target.value)}
                placeholder="No limit"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm text-gray-300">
              Active (visible to users)
            </label>
          </div>

          <div className="border border-slate-600 rounded-lg p-3 space-y-2">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Investment Options</p>
            <div className="flex items-center gap-2">
              <input
                id="allowAutoDebit"
                type="checkbox"
                checked={allowAutoDebit}
                onChange={(e) => setAllowAutoDebit(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="allowAutoDebit" className="text-sm text-gray-300">
                Allow Auto Debit / SIP
                <span className="text-gray-500 ml-1 text-xs">(daily, weekly or monthly recurring)</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="allowOneTimeInvestment"
                type="checkbox"
                checked={allowOneTimeInvestment}
                onChange={(e) => setAllowOneTimeInvestment(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="allowOneTimeInvestment" className="text-sm text-gray-300">
                Allow One-Time Investment
                <span className="text-gray-500 ml-1 text-xs">(lump-sum, debited immediately)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium transition-colors"
            >
              {saving ? 'Saving…' : initial ? 'Update Scheme' : 'Create Scheme'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-2 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
