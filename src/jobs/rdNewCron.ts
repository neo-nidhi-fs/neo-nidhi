import { dbConnect } from '@/lib/dbConnect';
import { RDSubscription } from '@/models/RDSubscription';
import { RDScheme } from '@/models/RDScheme';
import { User } from '@/models/User';
import { Transaction } from '@/models/Transaction';

/** Advance a date to the same mandateDay next month. */
function nextMonthSameDay(date: Date, mandateDay: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(mandateDay);
  return d;
}

export async function processRdNewDebits(referenceDate = new Date()) {
  await dbConnect();

  const dueSubs = await RDSubscription.find({
    status: { $in: ['active', 'missed'] },
    nextDebitDate: { $lte: referenceDate },
  });

  let processed = 0;
  let missed = 0;
  let completed = 0;

  for (const sub of dueSubs) {
    const [user, scheme] = await Promise.all([
      User.findById(sub.userId),
      RDScheme.findById(sub.schemeId),
    ]);

    if (!user || !scheme) continue;

    const now = new Date();

    if (user.savingsBalance < sub.monthlyAmount) {
      // Insufficient balance — mark missed
      await RDSubscription.findByIdAndUpdate(sub._id, {
        status: 'missed',
        $inc: { missedInstallments: 1 },
      });
      missed++;
      continue;
    }

    // Debit the installment
    const newInstallmentsPaid = sub.installmentsPaid + 1;
    const newTotalDebited = sub.totalDebited + sub.monthlyAmount;

    // Accrue monthly interest on running balance
    const monthlyInterest = newTotalDebited * (scheme.interestRate / 100 / 12);
    const newAccruedInterest = sub.accruedInterest + monthlyInterest;

    const isLastInstallment = newInstallmentsPaid >= scheme.tenureMonths;
    const maturityAmount = isLastInstallment
      ? newTotalDebited + newAccruedInterest
      : 0;

    const nextDebitDate = nextMonthSameDay(sub.nextDebitDate, sub.mandateDay);

    // Update user savings
    const savingsDelta = isLastInstallment
      ? -sub.monthlyAmount + maturityAmount // debit premium, then credit maturity
      : -sub.monthlyAmount;

    await User.findByIdAndUpdate(sub.userId, {
      $inc: { savingsBalance: savingsDelta },
    });

    // Update subscription
    await RDSubscription.findByIdAndUpdate(sub._id, {
      installmentsPaid: newInstallmentsPaid,
      totalDebited: newTotalDebited,
      accruedInterest: newAccruedInterest,
      lastDebitDate: now,
      nextDebitDate: isLastInstallment ? sub.nextDebitDate : nextDebitDate,
      status: isLastInstallment ? 'completed' : 'active',
      ...(isLastInstallment && {
        maturityAmount,
        maturityTransferredAt: now,
      }),
    });

    // Create the monthly debit transaction
    await Transaction.create({
      userId: sub.userId,
      type: 'rd_new',
      amount: sub.monthlyAmount,
      date: now,
      metadata: {
        subscriptionId: sub._id.toString(),
        schemeId: sub.schemeId.toString(),
        installmentNumber: newInstallmentsPaid,
        totalInstallments: scheme.tenureMonths,
        totalDebited: newTotalDebited,
        accruedInterest: newAccruedInterest,
      },
    });

    if (isLastInstallment) {
      // Create maturity credit transaction
      await Transaction.create({
        userId: sub.userId,
        type: 'rd_new_maturity',
        amount: maturityAmount,
        date: now,
        metadata: {
          subscriptionId: sub._id.toString(),
          schemeId: sub.schemeId.toString(),
          source: 'auto_maturity',
          principal: newTotalDebited,
          interest: newAccruedInterest,
        },
      });
      completed++;
    } else {
      processed++;
    }
  }

  return { processed, missed, completed };
}
