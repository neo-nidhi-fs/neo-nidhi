import { describe, it, expect } from 'vitest';
import { calculateEmiPaymentSplit } from './emi';

describe('calculateEmiPaymentSplit', () => {
  it('splits EMI into interest and principal for a standard loan payment', () => {
    const result = calculateEmiPaymentSplit(1_000_000, 10, 32_267);

    expect(result).toEqual({
      monthlyInterest: 8333.33,
      principalPaid: 23933.67,
    });
  });

  it('treats missing or zero interest rate as full principal repayment', () => {
    expect(calculateEmiPaymentSplit(50_000, 0, 10_000)).toEqual({
      monthlyInterest: 0,
      principalPaid: 10000,
    });

    expect(calculateEmiPaymentSplit(50_000, undefined, 10_000)).toEqual({
      monthlyInterest: 0,
      principalPaid: 10000,
    });
  });

  it('does not reduce principal when EMI is less than the monthly interest', () => {
    const result = calculateEmiPaymentSplit(1_000_000, 12, 5_000);

    expect(result).toEqual({
      monthlyInterest: 10000,
      principalPaid: 0,
    });
  });

  it('caps principal repayment to the remaining outstanding amount', () => {
    const result = calculateEmiPaymentSplit(15_000, 10, 50_000);

    expect(result).toEqual({
      monthlyInterest: 125,
      principalPaid: 15000,
    });
  });
});
