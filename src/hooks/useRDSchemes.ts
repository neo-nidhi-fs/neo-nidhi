'use client';

import { useState, useCallback } from 'react';
import { ServiceLocator } from '@/lib/services';
import type { IRDScheme, ICreateSchemeRequest } from '@/lib/services/rdNewService';

export function useRDSchemes() {
  const [schemes, setSchemes] = useState<IRDScheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const service = ServiceLocator.getRDNewService();

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await service.fetchSchemes();
    setLoading(false);
    if (result.success && result.data) {
      setSchemes(result.data);
    } else {
      setError(result.error || 'Failed to load schemes');
    }
  }, [service]);

  const createScheme = useCallback(
    async (data: ICreateSchemeRequest): Promise<boolean> => {
      const result = await service.createScheme(data);
      if (result.success) {
        await fetchSchemes();
        return true;
      }
      setError(result.error || 'Failed to create scheme');
      return false;
    },
    [service, fetchSchemes]
  );

  const updateScheme = useCallback(
    async (schemeId: string, data: Partial<ICreateSchemeRequest>): Promise<boolean> => {
      const result = await service.updateScheme(schemeId, data);
      if (result.success) {
        await fetchSchemes();
        return true;
      }
      setError(result.error || 'Failed to update scheme');
      return false;
    },
    [service, fetchSchemes]
  );

  const deleteScheme = useCallback(
    async (schemeId: string): Promise<boolean> => {
      const result = await service.deleteScheme(schemeId);
      if (result.success) {
        await fetchSchemes();
        return true;
      }
      setError(result.error || 'Failed to delete scheme');
      return false;
    },
    [service, fetchSchemes]
  );

  return { schemes, loading, error, fetchSchemes, createScheme, updateScheme, deleteScheme };
}
