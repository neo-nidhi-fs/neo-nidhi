'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useRDSchemes } from '@/hooks/useRDSchemes';
import RDSchemesSection from '@/components/admin/rd/RDSchemesSection';
import RDSubscriptionsSection from '@/components/admin/rd/RDSubscriptionsSection';

interface CustomSession extends Session {
  user?: Session['user'] & { role?: string };
}

export default function AdminRDSchemesPage() {
  const { data: session, status } = useSession() as {
    data: CustomSession | null;
    status: string;
  };
  const router = useRouter();
  const { users, loading: usersLoading } = useAdminUsers();
  const { schemes, fetchSchemes } = useRDSchemes();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    const role = session?.user?.role;
    if (
      status === 'authenticated' &&
      role !== 'admin' &&
      role !== 'privileged'
    ) {
      router.push('/user/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  if (status === 'loading' || usersLoading) {
    return (
      <main className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </main>
    );
  }

  const simpleUsers = users.map((u) => ({ _id: u._id, name: u.name }));

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">RD Plans Management</h1>
          <p className="text-gray-400 text-sm mt-1">
            Create and manage recurring deposit schemes, and subscribe users.
          </p>
        </div>

        <RDSchemesSection />
        <RDSubscriptionsSection schemes={schemes} users={simpleUsers} />
      </div>
    </main>
  );
}
