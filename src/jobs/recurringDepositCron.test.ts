import { describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test';
});

import { buildRecurringDepositMaturityTransfer } from './recurringDepositCron';

describe('buildRecurringDepositMaturityTransfer', () => {
  it('returns the full principal amount to move back into savings at maturity', () => {
    const referenceDate = new Date('2026-06-30T00:00:00.000Z');

    const transfer = buildRecurringDepositMaturityTransfer(
      {
        monthlyAmount: 100,
        installmentsPaid: 3,
        transferredToSavings: false,
      },
      referenceDate
    );

    expect(transfer).toEqual({
      transferAmount: 300,
      maturityTransferredAmount: 300,
      maturityTransferredAt: referenceDate,
      transferredToSavings: true,
    });
  });
});
