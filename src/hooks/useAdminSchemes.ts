/**
 * Hook: useAdminSchemes
 * Manages scheme-related state and operations
 * Single Responsibility: Scheme management only
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminService, Scheme } from '@/lib/services/adminService';

export function useAdminSchemes() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [addSchemeLoading, setAddSchemeLoading] = useState(false);
  const [editSchemeLoading, setEditSchemeLoading] = useState(false);
  const [deleteSchemeLoading, setDeleteSchemeLoading] = useState<string | null>(
    null
  );

  const fetchSchemes = useCallback(async () => {
    try {
      const data = await adminService.fetchSchemes();
      setSchemes(data);
    } catch (err) {
      console.error('Error fetching schemes:', err);
    }
  }, []);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  const addScheme = useCallback(async (name: string, interestRate: number) => {
    try {
      setAddSchemeLoading(true);
      const newScheme = await adminService.createScheme(name, interestRate);
      setSchemes((prev) => [...prev, newScheme]);
      return { success: true, message: '✅ Scheme added successfully' };
    } catch (err) {
      return {
        success: false,
        message: `❌ Error: ${(err as Error).message}`,
      };
    } finally {
      setAddSchemeLoading(false);
    }
  }, []);

  const editScheme = useCallback(
    async (schemeId: string, name: string, interestRate: number) => {
      try {
        setEditSchemeLoading(true);
        const updatedScheme = await adminService.updateScheme(
          schemeId,
          name,
          interestRate
        );
        setSchemes((prev) =>
          prev.map((s) => (s._id === schemeId ? updatedScheme : s))
        );
        return { success: true, message: '✅ Scheme updated successfully' };
      } catch (err) {
        return {
          success: false,
          message: `❌ Error: ${(err as Error).message}`,
        };
      } finally {
        setEditSchemeLoading(false);
      }
    },
    []
  );

  const deleteScheme = useCallback(async (schemeId: string) => {
    try {
      setDeleteSchemeLoading(schemeId);
      await adminService.deleteScheme(schemeId);
      setSchemes((prev) => prev.filter((s) => s._id !== schemeId));
      return { success: true, message: '✅ Scheme deleted successfully' };
    } catch (err) {
      return {
        success: false,
        message: `❌ Error: ${(err as Error).message}`,
      };
    } finally {
      setDeleteSchemeLoading(null);
    }
  }, []);

  return {
    schemes,
    addSchemeLoading,
    editSchemeLoading,
    deleteSchemeLoading,
    addScheme,
    editScheme,
    deleteScheme,
  };
}
