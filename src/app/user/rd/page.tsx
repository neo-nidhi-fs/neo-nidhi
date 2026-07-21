'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { getUserFeatures } from '@/lib/userFeatures';
import { useUser } from '@/hooks/useServices';
import { useRDSchemes } from '@/hooks/useRDSchemes';
import { useRDSubscriptions } from '@/hooks/useRDSubscriptions';
import RDSchemeCard from '@/components/user/rd/RDSchemeCard';
import RDSubscriptionCard from '@/components/user/rd/RDSubscriptionCard';
import type { ICreateSubscriptionRequest } from '@/lib/services/rdNewService';

interface CustomSession extends Session {
  user?: Session['user'] & { id?: string; role?: string };
}

export default function UserRDPage() {
  const { data: session, status } = useSession() as { data: CustomSession | null; status: string };
  const router = useRouter();
  const userId = session?.user?.id ?? '';

  const { user, fetchUser } = useUser(userId);
  const { schemes, loading: schemesLoading, fetchSchemes } = useRDSchemes();
  const {
    subscriptions,
    loading: subsLoading,
    fetchSubscriptions,
    createSubscription,
  } = useRDSubscriptions(userId);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && session?.user?.role !== 'user') {
      router.push('/admin/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (userId) {
      fetchUser();
      fetchSchemes();
      fetchSubscriptions();
    }
  }, [userId, fetchUser, fetchSchemes, fetchSubscriptions]);

  // Enforce feature flag after user loads
  useEffect(() => {
    if (user) {
      const features = getUserFeatures(user);
      if (!features.rdNewEnabled) {
        router.replace('/user/dashboard');
      }
    }
  }, [user, router]);

  if (status === 'loading' || !user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </main>
    );
  }

  const features = getUserFeatures(user);
  if (!features.rdNewEnabled) return null;

  const activeSchemes = schemes.filter((s) => s.isActive);
  const mySubscriptions = subscriptions.filter((s) => s.userId === userId);
  const activeSubscriptions = mySubscriptions.filter((s) =>
    ['active', 'missed'].includes(s.status)
  );
  const pastSubscriptions = mySubscriptions.filter((s) =>
    ['completed', 'closed'].includes(s.status)
  );

  async function handleSubscribe(data: ICreateSubscriptionRequest): Promise<boolean> {
    return createSubscription(data);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">RD Plans</h1>
          <p className="text-gray-400 text-sm mt-1">
            Choose a recurring deposit scheme and grow your savings.
          </p>
        </div>

        {/* Active subscriptions */}
        {activeSubscriptions.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-cyan-400 mb-3">Your Active Plans</h2>
            {subsLoading ? (
              <p className="text-gray-400 text-sm">Loading…</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeSubscriptions.map((sub) => (
                  <RDSubscriptionCard key={sub._id} subscription={sub} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Available schemes */}
        <section>
          <h2 className="text-lg font-semibold text-cyan-400 mb-3">Available Schemes</h2>
          {schemesLoading ? (
            <p className="text-gray-400 text-sm">Loading schemes…</p>
          ) : activeSchemes.length === 0 ? (
            <p className="text-gray-400 text-sm">No RD schemes are available right now.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeSchemes.map((scheme) => (
                <RDSchemeCard
                  key={scheme._id}
                  scheme={scheme}
                  userId={userId}
                  onSubscribe={handleSubscribe}
                />
              ))}
            </div>
          )}
        </section>

        {/* Past / closed subscriptions */}
        {pastSubscriptions.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-400 mb-3">Past Plans</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pastSubscriptions.map((sub) => (
                <RDSubscriptionCard key={sub._id} subscription={sub} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
