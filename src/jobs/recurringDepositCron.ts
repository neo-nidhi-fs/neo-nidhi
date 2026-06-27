import { dbConnect } from '@/lib/dbConnect';
import { Transaction } from '@/models/Transaction';
import { User } from '@/models/User';

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export async function processRecurringDepositDebits(
  referenceDate = new Date()
) {
  await dbConnect();

  const users = await User.find({
    recurringDeposits: {
      $elemMatch: {
        status: { $in: ['active', 'missed'] },
        nextDebitDate: { $lte: referenceDate },
      },
    },
  });

  let processed = 0;
  let missed = 0;
  let completed = 0;

  for (const user of users) {
    for (const rdPlan of user.recurringDeposits) {
      if (!['active', 'missed'].includes(rdPlan.status)) continue;
      if (rdPlan.nextDebitDate > referenceDate) continue;
      if (rdPlan.installmentsPaid >= rdPlan.tenureMonths) continue;

      const installmentNumber = rdPlan.installmentsPaid + 1;
      const nextDebitDate = addMonths(rdPlan.nextDebitDate, 1);
      const nextStatus =
        installmentNumber >= rdPlan.tenureMonths ? 'completed' : 'active';

      const updatedUser = await User.findOneAndUpdate(
        {
          _id: user._id,
          savingsBalance: { $gte: rdPlan.monthlyAmount },
          'recurringDeposits._id': rdPlan._id,
          'recurringDeposits.installmentsPaid': rdPlan.installmentsPaid,
        },
        {
          $inc: {
            savingsBalance: -rdPlan.monthlyAmount,
            rd: rdPlan.monthlyAmount,
            'recurringDeposits.$.installmentsPaid': 1,
          },
          $set: {
            'recurringDeposits.$.nextDebitDate': nextDebitDate,
            'recurringDeposits.$.lastDebitDate': referenceDate,
            'recurringDeposits.$.status': nextStatus,
            'recurringDeposits.$.updatedAt': referenceDate,
          },
        },
        { new: true }
      );

      if (!updatedUser) {
        await User.updateOne(
          { _id: user._id, 'recurringDeposits._id': rdPlan._id },
          {
            $inc: { 'recurringDeposits.$.missedInstallments': 1 },
            $set: {
              'recurringDeposits.$.status': 'missed',
              'recurringDeposits.$.updatedAt': referenceDate,
            },
          }
        );
        missed += 1;
        continue;
      }

      await Transaction.create({
        userId: user._id,
        type: 'rd',
        amount: rdPlan.monthlyAmount,
        date: referenceDate,
        metadata: {
          recurringDepositId: rdPlan._id.toString(),
          monthlyAmount: rdPlan.monthlyAmount,
          tenureMonths: rdPlan.tenureMonths,
          installmentNumber,
          nextDebitDate: nextDebitDate.toISOString(),
          maturityDate: rdPlan.maturityDate.toISOString(),
          source: 'rd_cron',
        },
      });

      processed += 1;
      if (nextStatus === 'completed') {
        completed += 1;
      }
    }
  }

  return {
    usersChecked: users.length,
    installmentsProcessed: processed,
    installmentsMissed: missed,
    plansCompleted: completed,
  };
}
