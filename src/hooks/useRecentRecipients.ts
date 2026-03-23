import { useCallback, useEffect, useState } from 'react';
import { TRANSACTION_TYPES } from '@/constants/transfers';

export type RecentRecipient = {
  id: string;
  name: string;
};

export function useRecentRecipients(userId?: string, limit = 5) {
  const [recipients, setRecipients] = useState<RecentRecipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRecipients = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/users/${userId}/transactions`);
      const data = await res.json();

      if (!res.ok || !data?.data) {
        setError(data?.error || 'Failed to fetch recipients');
        return;
      }

      const transactions = Array.isArray(data.data) ? data.data : [];
      const seen = new Set<string>();
      const recent: RecentRecipient[] = [];

      for (const t of transactions) {
        if (t.type !== TRANSACTION_TYPES.WITHDRAWAL) continue;

        const relatedId = t.relatedUserId?.toString?.();
        const relatedName = t.relatedUserName?.trim();
        if (!relatedId || !relatedName) continue;

        const key = `${relatedId}:${relatedName}`;
        if (seen.has(key)) continue;

        seen.add(key);
        recent.push({ id: relatedId, name: relatedName });

        if (recent.length >= limit) break;
      }

      setRecipients(recent);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch recipients'
      );
    } finally {
      setLoading(false);
    }
  }, [limit, userId]);

  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  return {
    recipients,
    loading,
    error,
    refresh: fetchRecipients,
  };
}
