import { registerPlugin } from '@capacitor/core';
import { isNativeApp } from './platform';

export type NativeSmsMessage = {
  id: string;
  sender: string;
  body: string;
  receivedAt: string;
};

type SmsReaderPlugin = {
  requestReadPermission: () => Promise<{ granted: boolean }>;
  readRecentMessages: (options: {
    sinceEpochMs?: number;
    limit?: number;
  }) => Promise<{ messages: NativeSmsMessage[] }>;
};

const SmsReader = registerPlugin<SmsReaderPlugin>('SmsReader');

const SYNC_CURSOR_KEY = 'neo_nidhi_sms_sync_cursor_ms';

export async function requestSmsReadPermission(): Promise<boolean> {
  if (!isNativeApp()) return false;
  const permission = await SmsReader.requestReadPermission();
  return Boolean(permission.granted);
}

export async function syncFinanceSmsToServer(): Promise<{
  createdCount: number;
  skippedNonFinance: number;
  skippedDuplicates: number;
} | null> {
  if (!isNativeApp()) return null;

  const granted = await requestSmsReadPermission();
  if (!granted) return null;

  const sinceEpochMs = Number(localStorage.getItem(SYNC_CURSOR_KEY) || '0');
  const { messages } = await SmsReader.readRecentMessages({
    sinceEpochMs: Number.isFinite(sinceEpochMs) ? sinceEpochMs : 0,
    limit: 50,
  });

  if (!messages?.length) return null;

  const response = await fetch('/api/user/finance/ingest-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  const result = await response.json();
  if (!response.ok || !result?.success) {
    return null;
  }

  const latestEpoch = messages.reduce((max, message) => {
    const current = new Date(message.receivedAt).getTime();
    return Number.isFinite(current) ? Math.max(max, current) : max;
  }, sinceEpochMs);
  localStorage.setItem(SYNC_CURSOR_KEY, String(latestEpoch));

  return {
    createdCount: Number(result.data?.createdCount || 0),
    skippedNonFinance: Number(result.data?.skippedNonFinance || 0),
    skippedDuplicates: Number(result.data?.skippedDuplicates || 0),
  };
}
