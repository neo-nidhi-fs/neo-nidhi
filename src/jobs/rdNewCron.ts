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

/** Advance a date by 7 days (weekly SIP). */
function nextWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + 7);
  return d;
}

/** Advance a date by 1 day (daily SIP). */
function nextDay(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
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
    const investmentType = sub.investmentType ?? 'sip';
    const debitFrequency = sub.debitFrequency ?? 'monthly';
    const totalInstallments = sub.totalInstallments ?? scheme.tenureMonths;

    // ── One-time investment: process maturity payout ──────────────────────
    if (investmentType === 'one-time') {
      // Interest = principal × rate/100 × tenureMonths/12 (simple monthly interest)
      const accruedInterest =
        sub.totalDebited *
        (scheme.interestRate / 100 / 12) *
        scheme.tenureMonths;
      const maturityAmount = sub.totalDebited + accruedInterest;

      await User.findByIdAndUpdate(sub.userId, {
        $inc: { savingsBalance: maturityAmount },
      });

      await RDSubscription.findByIdAndUpdate(sub._id, {
        accruedInterest,
        status: 'completed',
        maturityAmount,
        maturityTransferredAt: now,
      });

      await Transaction.create({
        userId: sub.userId,
        type: 'rd_new_maturity',
        amount: maturityAmount,
        date: now,
        metadata: {
          subscriptionId: sub._id.toString(),
          schemeId: sub.schemeId.toString(),
          source: 'one_time_maturity',
          principal: sub.totalDebited,
          interest: accruedInterest,
        },
      });

      completed++;
      continue;
    }

    // ── SIP subscription: process installment debit ───────────────────────
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

    // Accrue interest on running balance per installment period
    const periodsPerYear =
      debitFrequency === 'daily' ? 365 : debitFrequency === 'weekly' ? 52 : 12;
    const periodInterest =
      newTotalDebited * (scheme.interestRate / 100 / periodsPerYear);
    const newAccruedInterest = sub.accruedInterest + periodInterest;

    const isLastInstallment = newInstallmentsPaid >= totalInstallments;
    const maturityAmount = isLastInstallment
      ? newTotalDebited + newAccruedInterest
      : 0;

    // Compute next debit date based on frequency
    let nextDebitDate: Date;
    if (debitFrequency === 'daily') {
      nextDebitDate = nextDay(sub.nextDebitDate);
    } else if (debitFrequency === 'weekly') {
      nextDebitDate = nextWeek(sub.nextDebitDate);
    } else {
      nextDebitDate = nextMonthSameDay(sub.nextDebitDate, sub.mandateDay);
    }

    // Update user savings
    const savingsDelta = isLastInstallment
      ? -sub.monthlyAmount + maturityAmount
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

    // Create the installment debit transaction
    await Transaction.create({
      userId: sub.userId,
      type: 'rd_new',
      amount: sub.monthlyAmount,
      date: now,
      metadata: {
        subscriptionId: sub._id.toString(),
        schemeId: sub.schemeId.toString(),
        installmentNumber: newInstallmentsPaid,
        totalInstallments,
        totalDebited: newTotalDebited,
        accruedInterest: newAccruedInterest,
        debitFrequency,
      },
    });
    await Transaction.create({
      userId: sub.userId,
      type: 'withdrawal',
      amount: sub.monthlyAmount,
      date: now,
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
