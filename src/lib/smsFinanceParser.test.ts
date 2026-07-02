import { describe, expect, it } from 'vitest';
import { parseFinanceSms, FinanceTransactionType } from './smsFinanceParser';

describe('parseFinanceSms', () => {
  it('marks Groww investment messages as investment with stock purchase source', () => {
    const parsed = parseFinanceSms('Rs. 5000 debited to groww invest');

    expect(parsed).not.toBeNull();
    expect(parsed?.type).toBe(FinanceTransactionType.Expense);
    expect(parsed?.category).toBe('Investment');
    expect(parsed?.source).toBe('Stock Purchase');
  });

  it('uses the place name as the source for purchases made at a venue', () => {
    const parsed = parseFinanceSms('Rs. 250 spent at Pizza Hut');

    expect(parsed).not.toBeNull();
    expect(parsed?.type).toBe(FinanceTransactionType.Expense);
    expect(parsed?.source).toBe('Pizza Hut');
  });

  it('extracts the destination payee after a To marker', () => {
    const parsed = parseFinanceSms(
      'Sent Rs.3049.00\nFrom HDFC Bank A/C *2211\nTo INDmoney Credit Card Repa'
    );

    expect(parsed).not.toBeNull();
    expect(parsed?.source).toBe('INDmoney Credit Card Repa');
  });

  it('extracts a vendor name after To and before date metadata', () => {
    const parsed = parseFinanceSms(
      'Sent Rs.340.00\nFrom HDFC Bank A/C *2211\nTo NEW SUPER TRADERS\nOn 01/07/26'
    );

    expect(parsed).not.toBeNull();
    expect(parsed?.source).toBe('NEW SUPER TRADERS');
  });

  it('extracts the place after an at marker in a complex meal wallet message', () => {
    const parsed = parseFinanceSms(
      'INR 1534 was spent on your MEAL WALLET ending XXXX 4366 on 26-JUN-26 09:42 AM at M S MVK GHATWAY RESTAURAN.'
    );

    expect(parsed).not.toBeNull();
    expect(parsed?.source).toBe('M S MVK GHATWAY RESTAURAN');
  });

  it('categorizes meal wallet spends as dining', () => {
    const parsed = parseFinanceSms('Rs. 300 paid via meal wallet');

    expect(parsed).not.toBeNull();
    expect(parsed?.category).toBe('Dining');
  });

  it('ignores FASTag expenses unless they are top ups', () => {
    expect(parseFinanceSms('Rs. 100 debited for FASTag')).toBeNull();

    const topUp = parseFinanceSms('Rs. 100 FASTag top up');
    expect(topUp).not.toBeNull();
    expect(topUp?.category).toBe('Other Expense');
  });
});
