// import cron from 'node-cron';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User'; // Mongoose model
import { Scheme } from '@/models/Scheme';
import { Transaction } from '@/models/Transaction';
import { Settings } from '@/models/Settings';

// Utility: calculate daily interest
export function calculateDailyInterest(
  principal: number,
  annualRate: number
): number {
  const dailyRate = annualRate / 365; // simple daily rate
  return principal * dailyRate;
}

export type DailyInterestAccountSlice = {
  savingsBalance: number;
  fd: number;
  loanBalance: number;
  customInterestRates?: {
    saving?: number | null;
    fd?: number | null;
    loan?: number | null;
  } | null;
};

type SchemeRateSlice = { name: string; interestRate: number };

/** One day of accrued interest per product, using the same rules as the daily cron. */
export function computeDailyInterestDeltas(
  account: DailyInterestAccountSlice,
  schemes: SchemeRateSlice[]
): { deltaSaving: number; deltaFd: number; deltaLoan: number } {
  const { savingsBalance, fd, loanBalance, customInterestRates } = account;
  let deltaSaving = 0;
  let deltaFd = 0;
  let deltaLoan = 0;

  for (const scheme of schemes) {
    let rate = scheme.interestRate;

    if (customInterestRates) {
      if (
        scheme.name === 'deposit' &&
        customInterestRates.saving !== null &&
        customInterestRates.saving !== undefined
      ) {
        rate = customInterestRates.saving;
      } else if (
        scheme.name === 'fd' &&
        customInterestRates.fd !== null &&
        customInterestRates.fd !== undefined
      ) {
        rate = customInterestRates.fd;
      } else if (
        scheme.name === 'loan' &&
        customInterestRates.loan !== null &&
        customInterestRates.loan !== undefined
      ) {
        rate = customInterestRates.loan;
      }
    }

    const annualRate = rate / 100;
    switch (scheme.name) {
      case 'deposit':
        if (savingsBalance > 0) {
          deltaSaving += calculateDailyInterest(savingsBalance, annualRate);
        }
        break;
      case 'fd':
        if (fd > 0) {
          deltaFd += calculateDailyInterest(fd, annualRate);
        }
        break;
      case 'loan':
        if (loanBalance > 0) {
          deltaLoan += calculateDailyInterest(loanBalance, annualRate);
        }
        break;
    }
  }

  return { deltaSaving, deltaFd, deltaLoan };
}

/** Calendar start of day (local) for storing lastInterestCalculationDate. */
function getStartOfToday(reference: Date = new Date()): Date {
  const d = new Date(reference);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Replaces accrued interest fields for every user: one day's interest (current balances &
 * rates) × calendar days elapsed in the month (e.g. on the 2nd, multiplier is 2).
 */
export async function recalculateAccruedInterestMonthToDate(
  referenceDate = new Date()
) {
  await dbConnect();

  const globalSettings = await Settings.findOne({}).sort({ _id: 1 });
  if (!globalSettings) {
    return {
      usersUpdated: 0,
      daysElapsed: 0,
      error: 'No settings record found',
    };
  }

  const schemes = await Scheme.find({});
  if (!schemes.length) {
    return { usersUpdated: 0, daysElapsed: 0, error: 'No schemes found' };
  }

  const daysElapsed = referenceDate.getDate();
  const accounts = await User.find({});

  for (const account of accounts) {
    const { deltaSaving, deltaFd, deltaLoan } = computeDailyInterestDeltas(
      account,
      schemes
    );
    await User.findByIdAndUpdate(account._id, {
      $set: {
        accruedSavingInterest: deltaSaving * daysElapsed,
        accruedFdInterest: deltaFd * daysElapsed,
        accruedLoanInterest: deltaLoan * daysElapsed,
      },
    });
  }

  await Settings.updateOne(
    { _id: globalSettings._id },
    { $set: { lastInterestCalculationDate: getStartOfToday(referenceDate) } }
  );

  return {
    usersUpdated: accounts.length,
    daysElapsed,
    error: null,
  };
}

// Utility: check if today is the last day of the month
function isLastDayOfMonth(): boolean {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return today.getMonth() !== tomorrow.getMonth();
}

// Utility: check if interest was already calculated today
function isToday(date: Date | null | undefined): boolean {
  if (!date) return false;
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

// Core interest calculation
export async function processInterest(shouldAddToAccount = false) {
  console.log('shouldAddToAccount ==> ', shouldAddToAccount);
  await dbConnect();

  const now = new Date();
  const startOfToday = getStartOfToday(now);

  // Ensure only a single Settings document is used as the global lock anchor.
  const globalSettings = await Settings.findOne({}).sort({ _id: 1 });
  if (!globalSettings) {
    console.warn('No settings record found. Interest calculation aborted.');
    return;
  }

  // If last interest was already calculated today, skip.
  if (isToday(globalSettings.lastInterestCalculationDate)) {
    console.log('Interest already calculated today (today check). Skipping...');
    return;
  }

  // Atomic claim to prevent concurrent same-day runs for the selected settings record
  const lock = await Settings.findOneAndUpdate(
    {
      _id: globalSettings._id,
      $or: [
        { lastInterestCalculationDate: { $exists: false } },
        { lastInterestCalculationDate: null },
        { lastInterestCalculationDate: { $lt: startOfToday } },
      ],
    },
    { $set: { lastInterestCalculationDate: startOfToday } },
    { new: true }
  );

  if (!lock) {
    console.log('Interest already calculated today (lock failed). Skipping...');
    return;
  }

  const accounts = await User.find({});
  const schemes = await Scheme.find({});

  // helper: persist single-account interest updates
  async function saveAccountInterest(
    userId: string | { toString(): string },
    interest: number,
    type: 'deposit' | 'fd' | 'loan'
  ) {
    const fieldMap: Record<string, string> = {
      deposit: 'accruedSavingInterest',
      fd: 'accruedFdInterest',
      loan: 'accruedLoanInterest',
    };
    const field = fieldMap[type];
    const inc: Record<string, number> = {};
    inc[field] = interest;

    const updated = await User.findByIdAndUpdate(
      userId,
      { $inc: inc },
      { new: true, upsert: true }
    );

    return updated;
  }

  for (const account of accounts) {
    const { deltaSaving, deltaFd, deltaLoan } = computeDailyInterestDeltas(
      account,
      schemes
    );

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
        await saveAccountInterest(account._id, deltaFd, 'fd');
      }
      if (deltaLoan !== 0) {
        await saveAccountInterest(account._id, deltaLoan, 'loan');
      }

      // On last day of month, transfer accrued interest to respective balances as transactions
      if (isLastDayOfMonth()) {
        const refreshedAccount = await User.findById(account._id);
        if (refreshedAccount) {
          const updateData: Record<string, number> = {};

          // Helper to create transaction and update balance
          async function createInterestTransaction(
            userId: string | { toString(): string },
            transactionType:
              | 'interest_deposit'
              | 'interest_fd'
              | 'interest_loan',
            amount: number,
            balanceField: string
          ) {
            if (amount <= 0) return;

            // Create transaction record
            await Transaction.create({
              userId,
              type: transactionType,
              amount,
              date: new Date(),
            });

            // Update balance
            const update: Record<string, number> = {};
            update[balanceField] = amount;
            await User.findByIdAndUpdate(userId, { $inc: update });

            console.log(
              `Created ${transactionType} transaction for ${userId.toString()}: ${amount}`
            );
          }

          try {
            if (refreshedAccount.accruedSavingInterest > 0) {
              await createInterestTransaction(
                account._id,
                'interest_deposit',
                refreshedAccount.accruedSavingInterest,
                'savingsBalance'
              );
              updateData.accruedSavingInterest = 0;
            }

            if (refreshedAccount.accruedFdInterest > 0) {
              await createInterestTransaction(
                account._id,
                'interest_fd',
                refreshedAccount.accruedFdInterest,
                'fd'
              );
              updateData.accruedFdInterest = 0;
            }

            if (refreshedAccount.accruedLoanInterest > 0) {
              await createInterestTransaction(
                account._id,
                'interest_loan',
                refreshedAccount.accruedLoanInterest,
                'loanBalance'
              );
              updateData.accruedLoanInterest = 0;
            }

            // Reset accrued interest fields
            if (Object.keys(updateData).length > 0) {
              await User.findByIdAndUpdate(
                account._id,
                { $set: updateData },
                { new: true }
              );
              console.log(
                'Transferred accrued interest via transactions for',
                account._id?.toString()
              );
            }
          } catch (transactionErr) {
            console.error(
              'Failed to create interest transactions for',
              account._id?.toString(),
              transactionErr
            );
          }
        }
      }
    } catch (err) {
      console.error(
        'Failed to update accrued interest for',
        account._id?.toString(),
        err
      );
    }
  }

  // lastInterestCalculationDate was set at the start with the atomic lock.
  console.log('Interest calculation completed for the day.');
}

// cron.schedule('0 16 * * *', async () => {
//   console.log('Running daily interest calculation...');
//   await processInterest();
// });
