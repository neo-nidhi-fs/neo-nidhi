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
