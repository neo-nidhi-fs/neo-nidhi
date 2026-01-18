import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Transaction } from '@/models/Transaction';
import { Scheme } from '@/models/Scheme';
import { calculateInterestFromTransactions } from '@/lib/interest';
import { calculateMonthlyInterest } from '@/utils/interestCalculator';
import { recalculateBalances } from '@/utils/recalculateBalance';

interface BalanceUpdate {
  savingsBalance: number;
  fdBalance: number;
  loanBalance: number;
}

export async function POST() {
  try {
    await dbConnect();
    const today = new Date();
    const users = await User.find({});
    const schemes = await Scheme.find({});

    if (schemes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No schemes found' },
        { status: 400 }
      );
    }

    type Result = {
      userId: typeof User.prototype._id;
      username: string;
      interestAdded: number;
      interestTransactions: Array<{
        userId: typeof User.prototype._id;
        type: string;
        amount: number;
        date: Date;
      }>;
      newBalances: BalanceUpdate;
    };

    const results: Result[] = [];

    for (const user of users) {
      // // Check if already calculated this month
      // if (
      //   user.lastInterestCalc &&
      //   user.lastInterestCalc.getMonth() === today.getMonth() &&
      //   user.lastInterestCalc.getFullYear() === today.getFullYear() &&
      //   user.name !== 'Admin'
      // ) {
      //   console.log(`Skipping ${user.name} - already calculated this month`);
      //   continue;
      // }

      const transactions = await Transaction.find({ userId: user._id }).sort({
        date: 1,
      });
      if (transactions.length === 0) {
        console.log(`No transactions for user ${user.name}`);
        continue;
      }

      let interestAdded = 0;
      const interestTransactions: Array<{
        userId: typeof user._id;
        type: string;
        amount: number;
        date: Date;
      }> = [];

      // Process each scheme
      for (const scheme of schemes) {
        let interest = 0;

        if (scheme.name === 'deposit') {
          const savingTransactions = transactions.filter(
            (tx) => tx.type === 'deposit' || tx.type === 'withdrawal'
          );

          if (savingTransactions.length > 0) {
            const lastCalcDate = user.lastInterestCalc || new Date(0);

            // Separate old deposits (before last calc) and new deposits (after last calc)
            const oldTransactions = savingTransactions.filter(
              (tx) => tx.date <= lastCalcDate
            );
            const newTransactions = savingTransactions.filter(
              (tx) => tx.date > lastCalcDate
            );

            let oldInterest = 0;
            let newInterest = 0;

            // Calculate interest on old deposits only for the period after last calc
            if (oldTransactions.length > 0) {
              oldInterest = calculateInterestFromTransactions(
                [
                  ...oldTransactions,
                  ...savingTransactions.filter(
                    (tx) => tx.type === 'withdrawal' && tx.date > lastCalcDate
                  ),
                ].map((tx) => ({
                  type: tx.type,
                  amount: tx.amount,
                  date:
                    tx.type === 'withdrawal' && tx.date > lastCalcDate
                      ? tx.date
                      : new Date(
                          Math.max(tx.date.getTime(), lastCalcDate.getTime())
                        ),
                })),
                scheme.interestRate,
                today
              );
            }

            // Calculate interest on new deposits
            if (newTransactions.length > 0) {
              newInterest = calculateInterestFromTransactions(
                newTransactions.map((tx) => ({
                  type: tx.type,
                  amount: tx.amount,
                  date: tx.date,
                })),
                scheme.interestRate,
                today
              );
            }

            interest = oldInterest + newInterest;
            console.log('newInterest ==> ', newInterest);
            console.log('oldInterest ==> ', oldInterest);
          }
        } else if (scheme.name === 'fd') {
          const fdTransactions = transactions.filter((tx) => tx.type === 'fd');
          console.log('fdTransactions ==> ', fdTransactions);

          const lastCalcDate = user.lastInterestCalc || new Date(0);

          // Separate old deposits (before last calc) and new deposits (after last calc)
          const oldTransactions = fdTransactions.filter(
            (tx) => tx.date <= lastCalcDate
          );
          const newTransactions = fdTransactions.filter(
            (tx) => tx.date > lastCalcDate
          );
          console.log('oldTransactions ==> ', oldTransactions);
          console.log('newTransactions ==> ', newTransactions);

          let oldInterest = 0;
          let newInterest = 0;

          // Calculate interest on old deposits only for the period after last calc
          if (oldTransactions.length > 0) {
            oldInterest = calculateMonthlyInterest(
              scheme.name,
              oldTransactions.reduce((sum, tx) => sum + tx.amount, 0),
              scheme.interestRate,
              oldTransactions[0].date,
              today
            );
          }

          // Calculate interest on new deposits
          if (newTransactions.length > 0) {
            newInterest = calculateMonthlyInterest(
              scheme.name,
              newTransactions.reduce((sum, tx) => sum + tx.amount, 0),
              scheme.interestRate,
              newTransactions[0].date,
              today
            );
          }

          interest = oldInterest + newInterest;
          console.log('fd newInterest ==> ', newInterest);
          console.log('fd oldInterest ==> ', oldInterest);
        } else if (scheme.name === 'loan') {
          const loanTransactions = transactions.filter(
            (tx) => tx.type === 'loan' || tx.type === 'repayment'
          );

          if (loanTransactions.length > 0) {
            interest = calculateMonthlyInterest(
              scheme.name,
              loanTransactions.reduce(
                (sum, tx) =>
                  sum + (tx.type === 'loan' ? tx.amount : -tx.amount),
                0
              ),
              scheme.interestRate,
              loanTransactions[0].date,
              today
            );
          }
        }

        if (interest > 0) {
          const interestTx = new Transaction({
            userId: user._id,
            type: 'interest_' + scheme.name,
            amount: interest,
            date: today,
          });
          await interestTx.save();
          interestTransactions.push({
            userId: user._id,
            type: 'interest',
            amount: interest,
            date: today,
          });
          interestAdded += interest;
        }
      }

      // Only update lastInterestCalc if interest was actually added
      if (interestAdded > 0) {
        // Recalculate balances from all transactions
        const newBalances = await recalculateBalances(user._id.toString());

        // Update user with new balances and mark interest as calculated
        user.savingsBalance = newBalances.savingsBalance;
        user.fd = newBalances.fdBalance;
        user.loanBalance = newBalances.loanBalance;
        user.lastInterestCalc = today;

        await user.save();

        results.push({
          userId: user._id,
          username: user.name,
          interestAdded,
          interestTransactions,
          newBalances,
        });

        console.log(
          `✅ Updated balances for ${user.name}: Savings=${newBalances.savingsBalance}, FD=${newBalances.fdBalance}, Loan=${newBalances.loanBalance}`
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Interest calculated for ${results.length} users`,
        results,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error calculating interest:', errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
