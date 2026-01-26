import cron from 'node-cron';
import { User } from '@/models/User'; // Mongoose model
import { Scheme } from '@/models/Scheme';

// Utility: calculate daily interest
function calculateDailyInterest(principal: number, annualRate: number): number {
  const dailyRate = annualRate / 365; // simple daily rate
  return principal * dailyRate;
}

// Core interest calculation
export async function processInterest() {
  const accounts = await User.find();
  const schemes = await Scheme.find();

  for (const account of accounts) {
    const { savingsBalance, fd, loanBalance } = account;

    for (const scheme of schemes) {
      const annualRate = scheme.interestRate / 100;
      switch (scheme.name) {
        case 'deposit':
          if (savingsBalance > 0) {
            const dailyInterest = calculateDailyInterest(
              savingsBalance,
              annualRate
            );
            account.accruedSavingInterest += dailyInterest;
          }
          break;
        case 'fd':
          if (fd > 0) {
            const dailyInterest = calculateDailyInterest(fd, annualRate);
            account.accruedFdInterest += dailyInterest;
          }
          break;
        case 'loan':
          if (loanBalance > 0) {
            const dailyInterest = calculateDailyInterest(
              loanBalance,
              annualRate
            );
            account.accruedLoanInterest += dailyInterest;
          }
          break;
      }
    }
    // Compound monthly: if today is month-end, add accrued interest
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (tomorrow.getDate() === 1) {
      account.savingsBalance += account.accruedSavingInterest;
      account.fd += account.accruedFdInterest;
      account.loanBalance += account.accruedLoanInterest;

      account.accruedSavingInterest = 0;
      account.accruedFdInterest = 0;
      account.accruedLoanInterest = 0;
    }

    await account.save();
  }
}

// Cron job: run daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily interest calculation...');
  await processInterest();
});
