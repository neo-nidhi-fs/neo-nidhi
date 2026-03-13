/**
 * Hook: useAdminFdWithdraw
 * Manages FD withdrawal operations
 * Single Responsibility: FD withdrawal management only
 */

'use client';

import { useCallback, useState } from 'react';
import { adminService, FdWithdrawInfo } from '@/lib/services/adminService';

export function useAdminFdWithdraw() {
  const [fdWithdrawLoading, setFdWithdrawLoading] = useState(false);
  const [fdWithdrawInfo, setFdWithdrawInfo] = useState<FdWithdrawInfo>({
    matureAmount: 0,
    prematureAmount: 0,
    totalFd: 0,
    matureTransactions: [],
    prematureTransactions: [],
  });

  const fetchFdInfo = useCallback(async (userId: string) => {
    try {
      const data = await adminService.fetchFdWithdrawInfo(userId);
      setFdWithdrawInfo(data);
    } catch (err) {
      console.error('Error fetching FD info:', err);
    }
  }, []);

  const withdrawFd = useCallback(async (userId: string, amount: number) => {
    try {
      setFdWithdrawLoading(true);
      const result = await adminService.withdrawFd(userId, amount);
      return {
        success: true,
        message: `✅ FD withdrawal successful: ${result.message}`,
      };
    } catch (err) {
      return {
        success: false,
        message: `❌ Error: ${(err as Error).message}`,
      };
    } finally {
      setFdWithdrawLoading(false);
    }
  }, []);

  return {
    fdWithdrawLoading,
    fdWithdrawInfo,
    fetchFdInfo,
    withdrawFd,
  };
}
