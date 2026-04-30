'use client';

import { useEffect } from 'react';
import { isNativeApp } from '@/lib/native';
import { syncFinanceSmsToServer } from '@/lib/native/sms';

const POLL_INTERVAL_MS = 60 * 1000;

export function useAutoSmsFinanceSync(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !isNativeApp()) return;

    let cancelled = false;

    const runSync = async () => {
      if (cancelled) return;
      try {
        await syncFinanceSmsToServer();
      } catch (error) {
        console.error('SMS auto-sync failed:', error);
      }
    };

    runSync();
    const timer = window.setInterval(runSync, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [enabled]);
}
