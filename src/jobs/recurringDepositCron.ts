import { dbConnect } from '@/lib/dbConnect';
import { Transaction } from '@/models/Transaction';
import { User } from '@/models/User';

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function buildRecurringDepositMaturityTransfer(
  rdPlan: {
    monthlyAmount: number;
    installmentsPaid: number;
    transferredToSavings?: boolean;
  },
  referenceDate: Date
) {
  const transferAmount = Math.max(
    0,
    (rdPlan.monthlyAmount || 0) * Math.max(0, rdPlan.installmentsPaid || 0)
  );

  return {
    transferAmount,
    maturityTransferredAmount: transferAmount,
    maturityTransferredAt: referenceDate,
    transferredToSavings: true,
  };
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

      const maturityTransfer =
        nextStatus === 'completed' && !rdPlan.transferredToSavings
          ? buildRecurringDepositMaturityTransfer(
              {
                monthlyAmount: rdPlan.monthlyAmount,
                installmentsPaid: installmentNumber,
                transferredToSavings: false,
              },
              referenceDate
            )
          : null;

      const updatedUser = await User.findOneAndUpdate(
        {
          _id: user._id,
          savingsBalance: { $gte: rdPlan.monthlyAmount },
          'recurringDeposits._id': rdPlan._id,
          'recurringDeposits.installmentsPaid': rdPlan.installmentsPaid,
        },
        {
          $inc: {
            savingsBalance: -rdPlan.monthlyAmount + (maturityTransfer?.transferAmount || 0),
            rd: rdPlan.monthlyAmount - (maturityTransfer?.transferAmount || 0),
            'recurringDeposits.$.installmentsPaid': 1,
          },
          $set: {
            'recurringDeposits.$.nextDebitDate': nextDebitDate,
            'recurringDeposits.$.lastDebitDate': referenceDate,
            'recurringDeposits.$.status': nextStatus,
            'recurringDeposits.$.transferredToSavings':
              maturityTransfer?.transferredToSavings ?? false,
            'recurringDeposits.$.maturityTransferredAmount':
              maturityTransfer?.maturityTransferredAmount ?? 0,
            'recurringDeposits.$.maturityTransferredAt':
              maturityTransfer?.maturityTransferredAt ?? null,
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

      if (maturityTransfer && maturityTransfer.transferAmount > 0) {
        await Transaction.create({
          userId: user._id,
          type: 'deposit',
          amount: maturityTransfer.transferAmount,
          date: referenceDate,
          metadata: {
            recurringDepositId: rdPlan._id.toString(),
            monthlyAmount: rdPlan.monthlyAmount,
            tenureMonths: rdPlan.tenureMonths,
            installmentNumber,
            maturityTransferredAt: referenceDate.toISOString(),
            source: 'rd_maturity_transfer',
          },
        });
      }

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
