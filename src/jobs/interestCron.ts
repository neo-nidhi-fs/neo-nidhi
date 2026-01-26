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
  const accounts = await User.find({});
  const schemes = await Scheme.find({});

  // helper: persist single-account interest updates
  async function saveAccountInterest(
    userId: string | { toString(): string },
    interest: number,
    type: 'deposit' | 'fd' | 'loan'
  ) {
    console.log('Saving interest for', userId.toString(), type, interest);
    const fieldMap: Record<string, string> = {
      deposit: 'accruedSavingInterest',
      fd: 'accruedFdInterest',
      loan: 'accruedLoanInterest',
    };
    const field = fieldMap[type];
    const inc: Record<string, number> = {};
    inc[field] = interest;
    console.log('inc ==> ', inc);

    const updated = await User.findByIdAndUpdate(
      userId,
      { $inc: inc },
      { new: true, upsert: true }
    );

    console.log('updated ==> ', updated);
    return updated;
  }

  for (const account of accounts) {
    const { savingsBalance, fd, loanBalance } = account;

    // accumulate deltas to minimize writes
    let deltaSaving = 0;
    let deltaFd = 0;
    let deltaLoan = 0;

    for (const scheme of schemes) {
      const annualRate = scheme.interestRate / 100;
      switch (scheme.name) {
        case 'deposit':
          if (savingsBalance > 0) {
            const dailyInterest = calculateDailyInterest(
              savingsBalance,
              annualRate
            );
            deltaSaving += dailyInterest;
          }
          break;
        case 'fd':
          if (fd > 0) {
            const dailyInterest = calculateDailyInterest(fd, annualRate);
            deltaFd += dailyInterest;
          }
          break;
        case 'loan':
          if (loanBalance > 0) {
            const dailyInterest = calculateDailyInterest(
              loanBalance,
              annualRate
            );
            deltaLoan += dailyInterest;
          }
          break;
      }
    }

    // persist accumulated deltas
    try {
      if (deltaSaving !== 0) {
        const res = await saveAccountInterest(
          account._id,
          deltaSaving,
          'deposit'
        );
        console.log(
          'Updated saving interest for',
          account._id?.toString(),
          res
        );
      }
      if (deltaFd !== 0) {
        const res = await saveAccountInterest(account._id, deltaFd, 'fd');
        console.log('Updated fd interest for', account._id?.toString(), res);
      }
      console.log('deltaLoan ==> ', deltaLoan);
      if (deltaLoan !== 0) {
        const res = await saveAccountInterest(account._id, deltaLoan, 'loan');
        console.log('Updated loan interest for', account._id?.toString(), res);
      }
    } catch (err) {
      console.error(
        'Failed to update accrued interest for',
        account._id?.toString(),
        err
      );
    }
  }
}

// Cron job: run daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily interest calculation...');
  await processInterest();
});
