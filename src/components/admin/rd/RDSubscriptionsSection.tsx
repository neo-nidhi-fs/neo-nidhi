'use client';

import { useEffect, useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import type { IRDScheme, IRDSubscription, ICreateSubscriptionRequest } from '@/lib/services/rdNewService';
import { useRDSubscriptions } from '@/hooks/useRDSubscriptions';
import RDSubscribeDialog from './dialogs/RDSubscribeDialog';

interface AdminUser {
  _id: string;
  name: string;
}

interface Props {
  schemes: IRDScheme[];
  users: AdminUser[];
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
  return String(sub.schemeId);
}

export default function RDSubscriptionsSection({ schemes, users }: Props) {
  const { subscriptions, loading, error, fetchSubscriptions, createSubscription, closeSubscription } =
    useRDSubscriptions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [closeMsg, setCloseMsg] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  async function handleSubscribe(data: ICreateSubscriptionRequest): Promise<boolean> {
    return createSubscription(data);
  }

  async function handleClose(sub: IRDSubscription) {
    setCloseMsg('');
    const userName = users.find((u) => u._id === sub.userId)?.name ?? sub.userId;
    if (!confirm(`Close subscription for ${userName} on "${schemeName(sub)}"? This will credit the maturity amount to their savings.`)) return;
    const ok = await closeSubscription(sub._id);
    if (ok) {
      setCloseMsg('Subscription closed successfully.');
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function userName(userId: string) {
    return users.find((u) => u._id === userId)?.name ?? userId;
  }

  return (
    <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-cyan-400">RD Subscriptions</h2>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <UserPlus size={16} />
          Subscribe User
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      {closeMsg && <p className="text-green-400 text-sm mb-3">{closeMsg}</p>}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : subscriptions.length === 0 ? (
        <p className="text-gray-400 text-sm">No subscriptions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 border-b border-slate-700">
                <th className="pb-2 pr-3">User</th>
                <th className="pb-2 pr-3">Scheme</th>
                <th className="pb-2 pr-3">Monthly</th>
                <th className="pb-2 pr-3">Day</th>
                <th className="pb-2 pr-3">Progress</th>
                <th className="pb-2 pr-3">Accrued</th>
                <th className="pb-2 pr-3">Next Debit</th>
                <th className="pb-2 pr-3">Status</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => {
                const tenure =
                  typeof sub.schemeId === 'object' && sub.schemeId !== null
                    ? (sub.schemeId as IRDScheme & { tenureMonths: number }).tenureMonths
                    : '?';
                return (
                  <tr key={sub._id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-2 pr-3 text-white">{userName(sub.userId)}</td>
                    <td className="py-2 pr-3 text-gray-300">{schemeName(sub)}</td>
                    <td className="py-2 pr-3 text-gray-300">₹{sub.monthlyAmount}</td>
                    <td className="py-2 pr-3 text-gray-300">{sub.mandateDay}</td>
                    <td className="py-2 pr-3 text-gray-300">
                      {sub.installmentsPaid}/{tenure}
                    </td>
                    <td className="py-2 pr-3 text-green-400">
                      ₹{(sub.accruedInterest ?? 0).toFixed(2)}
                    </td>
                    <td className="py-2 pr-3 text-gray-300">
                      {sub.nextDebitDate ? formatDate(sub.nextDebitDate) : '—'}
                    </td>
                    <td className="py-2 pr-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[sub.status] ?? ''}`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-2">
                      {['active', 'missed'].includes(sub.status) && (
                        <button
                          onClick={() => handleClose(sub)}
                          title="Close subscription"
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <RDSubscribeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSubscribe}
        schemes={schemes}
        users={users}
      />
    </section>
  );
}
