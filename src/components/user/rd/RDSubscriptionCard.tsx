'use client';

import type { IRDSubscription, IRDScheme } from '@/lib/services/rdNewService';

interface Props {
  subscription: IRDSubscription;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  completed: 'bg-blue-500/20 text-blue-400',
  missed: 'bg-yellow-500/20 text-yellow-400',
  closed: 'bg-gray-500/20 text-gray-400',
};

function schemeName(sub: IRDSubscription): string {
  if (typeof sub.schemeId === 'object' && sub.schemeId !== null) {
    return (sub.schemeId as IRDScheme).name;
  }
  return 'Unknown Scheme';
}

function schemeRate(sub: IRDSubscription): number | null {
  if (typeof sub.schemeId === 'object' && sub.schemeId !== null) {
    return (sub.schemeId as IRDScheme).interestRate;
  }
  return null;
}

function schemeTenure(sub: IRDSubscription): number | null {
  if (typeof sub.schemeId === 'object' && sub.schemeId !== null) {
    return (sub.schemeId as IRDScheme).tenureMonths;
  }
  return null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDebitSchedule(sub: IRDSubscription): string {
  if (sub.investmentType === 'one-time') return 'One-time investment';
  const freq = sub.debitFrequency ?? 'monthly';
  if (freq === 'daily') return 'Every day';
  if (freq === 'weekly') {
    const day = sub.mandateDayOfWeek != null ? DAY_NAMES[sub.mandateDayOfWeek] : 'weekly';
    return `Every ${day}`;
  }
  const d = sub.mandateDay;
  const suffix = d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th';
  return `${d}${suffix} of month`;
}

export default function RDSubscriptionCard({ subscription: sub }: Props) {
  const tenure = schemeTenure(sub);
  const totalInst = sub.totalInstallments ?? tenure;
  const progress =
    totalInst && totalInst > 0
      ? Math.min((sub.installmentsPaid / totalInst) * 100, 100)
      : 0;

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-white font-semibold text-base">
            {schemeName(sub)}
          </h3>
          {schemeRate(sub) != null && (
            <p className="text-gray-400 text-xs mt-0.5">
              {schemeRate(sub)}% p.a.
            </p>
          )}
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[sub.status] ?? ''}`}
        >
          {sub.status}
        </span>
      </div>

      {/* Progress bar */}
      {totalInst != null && (
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>
              {sub.installmentsPaid} of {totalInst} installments
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-400 text-xs">
            {sub.investmentType === 'one-time' ? 'Invested Amount' : 'SIP Amount'}
          </p>
          <p className="text-white">₹{sub.monthlyAmount.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Debit Schedule</p>
          <p className="text-white text-xs">{formatDebitSchedule(sub)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Total Deposited</p>
          <p className="text-white">
            ₹{sub.totalDebited.toLocaleString('en-IN')}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Accrued Interest</p>
          <p className="text-green-400">
            ₹{(sub.accruedInterest ?? 0).toFixed(2)}
          </p>
        </div>
        {sub.nextDebitDate && sub.status === 'active' && (
          <div>
            <p className="text-gray-400 text-xs">Next Debit</p>
            <p className="text-cyan-300">{formatDate(sub.nextDebitDate)}</p>
          </div>
        )}
        <div>
          <p className="text-gray-400 text-xs">Maturity Date</p>
          <p className="text-white">{formatDate(sub.maturityDate)}</p>
        </div>
        {sub.maturityAmount != null && (
          <div className="col-span-2">
            <p className="text-gray-400 text-xs">Maturity Amount</p>
            <p className="text-green-400 font-semibold text-base">
              ₹{sub.maturityAmount.toFixed(2)}
            </p>
          </div>
        )}
        {sub.missedInstallments > 0 && (
          <div>
            <p className="text-gray-400 text-xs">Missed</p>
            <p className="text-yellow-400">{sub.missedInstallments}</p>
          </div>
        )}
      </div>
    </div>
  );
}
