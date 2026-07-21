'use client';

import { useState, useCallback } from 'react';
import { ServiceLocator } from '@/lib/services';
import type { IRDSubscription, ICreateSubscriptionRequest } from '@/lib/services/rdNewService';

export function useRDSubscriptions(userId?: string) {
  const [subscriptions, setSubscriptions] = useState<IRDSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const service = ServiceLocator.getRDNewService();

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await service.fetchSubscriptions(userId);
    setLoading(false);
    if (result.success && result.data) {
      setSubscriptions(result.data);
    } else {
      setError(result.error || 'Failed to load subscriptions');
    }
  }, [service, userId]);

  const createSubscription = useCallback(
    async (data: ICreateSubscriptionRequest): Promise<boolean> => {
      const result = await service.createSubscription(data);
      if (result.success) {
        await fetchSubscriptions();
        return true;
      }
      setError(result.error || 'Failed to create subscription');
      return false;
    },
    [service, fetchSubscriptions]
  );

  const closeSubscription = useCallback(
    async (subscriptionId: string): Promise<boolean> => {
      const result = await service.closeSubscription(subscriptionId);
      if (result.success) {
        await fetchSubscriptions();
        return true;
      }
      setError(result.error || 'Failed to close subscription');
      return false;
    },
    [service, fetchSubscriptions]
  );

  return { subscriptions, loading, error, fetchSubscriptions, createSubscription, closeSubscription };
}
