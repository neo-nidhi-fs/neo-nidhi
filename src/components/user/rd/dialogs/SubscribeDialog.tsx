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

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SubscribeDialog({
  open,
  onClose,
  scheme,
  userId,
  onSave,
}: Props) {
  // Determine default tab
  const defaultTab: 'sip' | 'one-time' =
    scheme.allowAutoDebit ? 'sip' : 'one-time';
  const [tab, setTab] = useState<'sip' | 'one-time'>(defaultTab);

  // SIP state
  const [sipAmount, setSipAmount] = useState(String(scheme.minMonthlyAmount));
  const [debitFrequency, setDebitFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [mandateDay, setMandateDay] = useState('5');
  const [mandateDayOfWeek, setMandateDayOfWeek] = useState('1'); // Monday default

  // One-time state
  const [oneTimeAmount, setOneTimeAmount] = useState(String(scheme.minMonthlyAmount));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    let ok: boolean;
    if (tab === 'one-time') {
      ok = await onSave({
        userId,
        schemeId: scheme._id,
        investmentType: 'one-time',
        monthlyAmount: Number(oneTimeAmount),
        mandateDay: 1,
      });
    } else {
      ok = await onSave({
        userId,
        schemeId: scheme._id,
        investmentType: 'sip',
        debitFrequency,
        monthlyAmount: Number(sipAmount),
        mandateDay: debitFrequency === 'monthly' ? Number(mandateDay) : 1,
        mandateDayOfWeek:
          debitFrequency === 'weekly' ? Number(mandateDayOfWeek) : null,
      });
    }

    setSaving(false);
    if (ok) {
      onClose();
    } else {
      setError('Could not subscribe. Please check the details and try again.');
    }
  }

  const inputCls =
    'w-full border border-slate-600 bg-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  const hasBothOptions = scheme.allowAutoDebit && scheme.allowOneTimeInvestment;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[90vw] sm:w-full max-w-sm max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">
            Invest in {scheme.name}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-400 mt-1">
          {scheme.interestRate}% p.a. · {scheme.tenureMonths} months
        </p>

        {/* Tab switcher — only shown when both options are available */}
        {hasBothOptions && (
          <div className="flex rounded-lg overflow-hidden border border-slate-600 mt-3">
            <button
              type="button"
              onClick={() => setTab('sip')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === 'sip'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              SIP / Auto Debit
            </button>
            <button
              type="button"
              onClick={() => setTab('one-time')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === 'one-time'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              One-Time
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* ── One-Time Investment ── */}
          {tab === 'one-time' && (
            <>
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3 text-xs text-blue-300">
                Your investment will be debited immediately and returned with interest at maturity ({scheme.tenureMonths} months).
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Investment Amount (₹)
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
                  value={oneTimeAmount}
                  onChange={(e) => setOneTimeAmount(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* ── SIP / Auto Debit ── */}
          {tab === 'sip' && (
            <>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Debit Frequency
                </label>
                <select
                  className={inputCls}
                  value={debitFrequency}
                  onChange={(e) =>
                    setDebitFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')
                  }
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  SIP Amount (₹)
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
                  value={sipAmount}
                  onChange={(e) => setSipAmount(e.target.value)}
                  required
                />
              </div>

              {debitFrequency === 'monthly' && (
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Debit Day of Month (1–28)
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
              )}

              {debitFrequency === 'weekly' && (
                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    Debit Day of Week
                  </label>
                  <select
                    className={inputCls}
                    value={mandateDayOfWeek}
                    onChange={(e) => setMandateDayOfWeek(e.target.value)}
                  >
                    {DAY_NAMES.map((name, i) => (
                      <option key={i} value={i}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {debitFrequency === 'daily' && (
                <p className="text-xs text-gray-400">
                  ₹{sipAmount || scheme.minMonthlyAmount} will be debited from your savings every day.
                </p>
              )}
            </>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium transition-colors"
            >
              {saving
                ? 'Processing…'
                : tab === 'one-time'
                  ? 'Invest Now'
                  : 'Start SIP'}
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
