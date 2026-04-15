import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateEmiPaymentSplit } from './emi';

test('splits EMI into interest and principal for a standard loan payment', () => {
  const result = calculateEmiPaymentSplit(1_000_000, 10, 32_267);

  assert.deepEqual(result, {
    monthlyInterest: 8333.33,
    principalPaid: 23933.67,
  });
});

test('treats missing or zero interest rate as full principal repayment', () => {
  assert.deepEqual(calculateEmiPaymentSplit(50_000, 0, 10_000), {
    monthlyInterest: 0,
    principalPaid: 10000,
  });

  assert.deepEqual(calculateEmiPaymentSplit(50_000, undefined, 10_000), {
    monthlyInterest: 0,
    principalPaid: 10000,
  });
});

test('does not reduce principal when EMI is less than the monthly interest', () => {
  const result = calculateEmiPaymentSplit(1_000_000, 12, 5_000);

  assert.deepEqual(result, {
    monthlyInterest: 10000,
    principalPaid: 0,
  });
});

test('caps principal repayment to the remaining outstanding amount', () => {
  const result = calculateEmiPaymentSplit(15_000, 10, 50_000);

  assert.deepEqual(result, {
    monthlyInterest: 125,
    principalPaid: 15000,
  });
});
