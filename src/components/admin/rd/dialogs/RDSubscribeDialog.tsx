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

interface AdminUser {
  _id: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: ICreateSubscriptionRequest) => Promise<boolean>;
  schemes: IRDScheme[];
  users: AdminUser[];
}

export default function RDSubscribeDialog({ open, onClose, onSave, schemes, users }: Props) {
  const [userId, setUserId] = useState('');
  const [schemeId, setSchemeId] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [mandateDay, setMandateDay] = useState('5');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedScheme = schemes.find((s) => s._id === schemeId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!userId || !schemeId) {
      setError('Please select a user and a scheme.');
      return;
    }
    setSaving(true);
    const ok = await onSave({
      userId,
      schemeId,
      monthlyAmount: Number(monthlyAmount),
      mandateDay: Number(mandateDay),
    });
    setSaving(false);
    if (ok) {
      setUserId('');
      setSchemeId('');
      setMonthlyAmount('');
      setMandateDay('5');
      onClose();
    } else {
      setError('Failed to subscribe. Check inputs and try again.');
    }
  }

  const selectCls =
    'w-full border border-slate-600 bg-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const inputCls = selectCls;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Subscribe User to RD Scheme</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div>
            <label className="block text-sm text-gray-300 mb-1">User *</label>
            <select className={selectCls} value={userId} onChange={(e) => setUserId(e.target.value)} required>
              <option value="">— Select user —</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Scheme *</label>
            <select className={selectCls} value={schemeId} onChange={(e) => setSchemeId(e.target.value)} required>
              <option value="">— Select scheme —</option>
              {schemes
                .filter((s) => s.isActive)
                .map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} — {s.interestRate}% p.a., {s.tenureMonths} months
                  </option>
                ))}
            </select>
            {selectedScheme && (
              <p className="text-xs text-gray-400 mt-1">
                Min: ₹{selectedScheme.minMonthlyAmount}
                {selectedScheme.maxMonthlyAmount != null
                  ? ` · Max: ₹${selectedScheme.maxMonthlyAmount}`
                  : ''}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Monthly Amount (₹) *</label>
              <input
                className={inputCls}
                type="number"
                min={selectedScheme?.minMonthlyAmount ?? 1}
                max={selectedScheme?.maxMonthlyAmount ?? undefined}
                step="1"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                required
                placeholder="1000"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Mandate Day (1–28) *</label>
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
          </div>

          <div className="flex gap-3 pt-2">
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div>
          <label className="block text-sm text-gray-300 mb-1">User *</label>
          <select className={selectCls} value={userId} onChange={(e) => setUserId(e.target.value)} required>
            <option value="">— Select user —</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Scheme *</label>
          <select className={selectCls} value={schemeId} onChange={(e) => setSchemeId(e.target.value)} required>
            <option value="">— Select scheme —</option>
            {schemes
              .filter((s) => s.isActive)
              .map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} — {s.interestRate}% p.a., {s.tenureMonths} months
                </option>
              ))}
          </select>
          {selectedScheme && (
            <p className="text-xs text-gray-400 mt-1">
              Min: ₹{selectedScheme.minMonthlyAmount}
              {selectedScheme.maxMonthlyAmount != null
                ? ` · Max: ₹${selectedScheme.maxMonthlyAmount}`
                : ''}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Monthly Amount (₹) *</label>
            <input
              className={inputCls}
              type="number"
              min={selectedScheme?.minMonthlyAmount ?? 1}
              max={selectedScheme?.maxMonthlyAmount ?? undefined}
              step="1"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(e.target.value)}
              required
              placeholder="1000"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Mandate Day (1–28) *</label>
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
        </div>

        <div className="flex gap-3 pt-2">
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
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </BaseDialog>
  );
}
