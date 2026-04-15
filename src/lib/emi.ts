export interface EmiPaymentSplit {
  monthlyInterest: number;
  principalPaid: number;
}

function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateEmiPaymentSplit(
  outstandingPrincipal: number,
  annualRate: number | null | undefined,
  emiAmount: number
): EmiPaymentSplit {
  const safeOutstanding = Math.max(0, outstandingPrincipal || 0);
  const safeRate = Math.max(0, annualRate || 0);
  const safeEmi = Math.max(0, emiAmount || 0);

  const monthlyInterest = roundToTwoDecimals(
    (safeOutstanding * safeRate) / 100 / 12
  );
  const principalBeforeCap = roundToTwoDecimals(
    Math.max(0, safeEmi - monthlyInterest)
  );
  const principalPaid = roundToTwoDecimals(
    Math.min(principalBeforeCap, safeOutstanding)
  );

  return {
    monthlyInterest,
    principalPaid,
  };
}
