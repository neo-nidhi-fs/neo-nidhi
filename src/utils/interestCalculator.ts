/**
 * Calculate monthly interest for different schemes.
 * 
 * @param scheme - "saving", "fd", "rd", "loan"
 * @param principal - initial amount
 * @param annualRate - annual interest rate in %
 * @param depositDate - date when deposit/loan started
 * @param currentDate - date of calculation (usually last day of month)
 * @param monthsPassed - optional, for FD/RD to calculate over multiple months
 */
export function calculateMonthlyInterest(
  scheme: "saving" | "fd" | "rd" | "loan",
  principal: number,
  annualRate: number,
  depositDate: Date,
  currentDate: Date,
  monthsPassed: number = 1
): number {
  // Convert annual rate to monthly rate
  const monthlyRate = annualRate / 12 / 100;

  // Calculate number of days in month for pro-rata interest
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
 
  const daysActive =
    (currentDate.getTime() - depositDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysActive < 0) return 0; // deposit not yet started

  // Pro-rata factor if deposit started mid-month
  const proRataFactor = Math.min(daysActive / daysInMonth, 1);

  let interest = 0;

  switch (scheme) {
    case "saving":
      // Simple monthly interest on balance
      interest = principal * monthlyRate * proRataFactor;
      break;

    case "fd":
      // FD: compound monthly interest
      interest =
        principal * (Math.pow(1 + monthlyRate, monthsPassed) - 1) * proRataFactor;
      break;

    case "rd":
      // RD: monthly installment deposits, interest compounded
      // Assume principal is monthly installment
      let rdTotal = 0;
      for (let i = 0; i < monthsPassed; i++) {
        rdTotal += principal * Math.pow(1 + monthlyRate, monthsPassed - i);
      }
      interest = (rdTotal - principal * monthsPassed) * proRataFactor;
      break;

    case "loan":
      // Loan: interest accrues monthly on outstanding balance
      interest = principal * monthlyRate * proRataFactor;
      break;
  }

  return parseFloat(interest.toFixed(2));
}