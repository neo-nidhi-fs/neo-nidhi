'use client';

import { useState } from 'react';
import type {
  IRDScheme,
  ICreateSubscriptionRequest,
} from '@/lib/services/rdNewService';
import SubscribeDialog from './dialogs/SubscribeDialog';

interface Props {
  scheme: IRDScheme;
  userId: string;
  onSubscribe: (data: ICreateSubscriptionRequest) => Promise<boolean>;
}

export default function RDSchemeCard({ scheme, userId, onSubscribe }: Props) {
  const [open, setOpen] = useState(false);

  const estimatedMaturity =
    scheme.minMonthlyAmount * scheme.tenureMonths +
    scheme.minMonthlyAmount *
      scheme.tenureMonths *
      ((scheme.tenureMonths + 1) / 2) *
      (scheme.interestRate / 100 / 12);

  return (
    <>
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 flex flex-col gap-3 hover:border-blue-500/50 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-white font-semibold text-base">
              {scheme.name}
            </h3>
            {scheme.description && (
              <p className="text-gray-400 text-xs mt-0.5">
                {scheme.description}
              </p>
            )}
          </div>
          <span className="bg-green-500/20 text-green-400 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
            {scheme.interestRate}% p.a.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-400 text-xs">Tenure</p>
            <p className="text-white">{scheme.tenureMonths} months</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Min Monthly</p>
            <p className="text-white">₹{scheme.minMonthlyAmount}</p>
          </div>
          {scheme.maxMonthlyAmount != null && (
            <div>
              <p className="text-gray-400 text-xs">Max Monthly</p>
              <p className="text-white">₹{scheme.maxMonthlyAmount}</p>
            </div>
          )}
          <div>
            <p className="text-gray-400 text-xs">Est. Maturity*</p>
            <p className="text-cyan-400 font-medium">
              ₹{Math.round(estimatedMaturity).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <p className="text-gray-500 text-xs">*Estimated on min amount</p>

        <button
          onClick={() => setOpen(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg py-2 transition-colors"
        >
          Subscribe
        </button>
      </div>

      <SubscribeDialog
        open={open}
        onClose={() => setOpen(false)}
        scheme={scheme}
        userId={userId}
        onSave={onSubscribe}
      />
    </>
  );
}
