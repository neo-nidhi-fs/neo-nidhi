/**
 * Hook: useAdminInterestRates
 * Manages custom interest rate operations
 * Single Responsibility: Interest rate management only
 */

'use client';

import { useCallback, useState } from 'react';
import { adminService } from '@/lib/services/adminService';

export function useAdminInterestRates() {
  const [interestRateLoading, setInterestRateLoading] = useState(false);

  const updateInterestRates = useCallback(
    async (
      userId: string,
      userName: string,
      rates: {
        saving?: number | null;
        fd?: number | null;
        loan?: number | null;
      }
    ) => {
      try {
        setInterestRateLoading(true);
        const updatedRates = await adminService.updateInterestRates(
          userId,
          rates
        );
        return {
          success: true,
          message: `✅ Interest rates updated for ${userName}`,
          data: updatedRates,
        };
      } catch (err) {
        return {
          success: false,
          message: `❌ Error: ${(err as Error).message}`,
        };
      } finally {
        setInterestRateLoading(false);
      }
    },
    []
  );

  return {
    interestRateLoading,
    updateInterestRates,
  };
}
