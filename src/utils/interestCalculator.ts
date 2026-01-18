import { differenceInDays, getDaysInMonth } from 'date-fns';

/**
 * Calculate monthly interest for different schemes.
 *
 * @param scheme - "saving", "fd", "rd", "loan"
 * @param principal - initial amount
 * @param annualRate - annual interest rate in %
 * @param depositDate - date when deposit/loan started
 * @param currentDate - date of calculation (usually last day of month)
 */
export function calculateMonthlyInterest(
  scheme: 'saving' | 'fd' | 'loan',
  principal: number,
  annualRate: number,
  depositDate: Date,
  currentDate: Date
): number {
  // Convert annual rate to monthly rate
  const monthlyRate = annualRate / 12 / 100;

  // Calculate pro-rata factor using date-fns
  const daysInMonth = getDaysInMonth(currentDate);
  const daysActive = differenceInDays(currentDate, depositDate);

  if (daysActive < 0) return 0; // deposit not yet started

  // Pro-rata factor if deposit started mid-month
  const proRataFactor = Math.min(daysActive / daysInMonth, 1);

  let interest = 0;

  switch (scheme) {
    case 'saving':
      // Simple monthly interest on balance
      interest = principal * monthlyRate * proRataFactor;
      break;

    case 'fd':
      // FD: compound monthly interest
      interest = principal * monthlyRate * proRataFactor;
      break;
    case 'loan':
      // Loan: interest accrues monthly on outstanding balance
      interest = principal * monthlyRate * proRataFactor;
      break;
  }

  return parseFloat(interest.toFixed(2));
}
