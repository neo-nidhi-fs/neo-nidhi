import cron from 'node-cron';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User'; // Mongoose model
import { Scheme } from '@/models/Scheme';
import { Transaction } from '@/models/Transaction';

// Utility: calculate daily interest
function calculateDailyInterest(principal: number, annualRate: number): number {
  const dailyRate = annualRate / 365; // simple daily rate
  return principal * dailyRate;
}

// Utility: check if today is the last day of the month
function isLastDayOfMonth(): boolean {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return today.getMonth() !== tomorrow.getMonth();
}

// Core interest calculation
export async function processInterest() {
  await dbConnect();
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
      if (deltaLoan !== 0) {
        const res = await saveAccountInterest(account._id, deltaLoan, 'loan');
        console.log('Updated loan interest for', account._id?.toString(), res);
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
}

// Cron job: run daily at 11:30 PM IST (6:00 PM UTC)
cron.schedule('0 16 * * *', async () => {
  console.log('Running daily interest calculation...');
  await processInterest();
});
