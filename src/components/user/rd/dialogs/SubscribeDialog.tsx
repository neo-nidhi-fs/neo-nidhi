'use client';

import { useState } from 'react';
import type { IRDScheme } from '@/lib/services/rdNewService';
import type { ICreateSubscriptionRequest } from '@/lib/services/rdNewService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
  scheme: IRDScheme;
  userId: string;
  onSave: (data: ICreateSubscriptionRequest) => Promise<boolean>;
}

export default function SubscribeDialog({
  open,
  onClose,
  scheme,
  userId,
  onSave,
}: Props) {
  const [monthlyAmount, setMonthlyAmount] = useState(
    String(scheme.minMonthlyAmount)
  );
  const [mandateDay, setMandateDay] = useState('5');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const ok = await onSave({
      userId,
      schemeId: scheme._id,
      monthlyAmount: Number(monthlyAmount),
      mandateDay: Number(mandateDay),
    });
    setSaving(false);
    if (ok) {
      onClose();
    } else {
      setError('Could not subscribe. Please check the details and try again.');
    }
  }

  const inputCls =
    'w-full border border-slate-600 bg-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[90vw] sm:w-full max-w-sm max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">
            Subscribe to {scheme.name}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-400 mt-1">
          {scheme.interestRate}% p.a. · {scheme.tenureMonths} months
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Monthly Amount (₹)
              <span className="text-gray-500 ml-1">
                min ₹{scheme.minMonthlyAmount}
                {scheme.maxMonthlyAmount != null
                  ? ` · max ₹${scheme.maxMonthlyAmount}`
                  : ''}
              </span>
            </label>
            <input
              className={inputCls}
              type="number"
              min={scheme.minMonthlyAmount}
              max={scheme.maxMonthlyAmount ?? undefined}
              step="1"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Mandate Day (1–28)
              <span className="text-gray-500 ml-1">
                day of month for auto-debit
              </span>
            </label>
            <input
              className={inputCls}
              type="number"
              min="1"
              max="28"
              step="1"
              value={mandateDay}
              onChange={(e) => setMandateDay(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium transition-colors"
            >
              {saving ? 'Subscribing…' : 'Subscribe'}
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
