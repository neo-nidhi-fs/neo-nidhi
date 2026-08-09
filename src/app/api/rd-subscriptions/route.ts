import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/dbConnect';
import { RDScheme } from '@/models/RDScheme';
import { RDSubscription } from '@/models/RDSubscription';
import { Transaction } from '@/models/Transaction';
import { requireAdminLikeAccess, canManageUser } from '@/lib/adminAccess';
import { isFeatureEnabled } from '@/lib/userFeatures';
import { User } from '@/models/User';

/** Returns the next date on `mandateDay` that is after `fromDate`. */
function nextMandateDayAfter(fromDate: Date, mandateDay: number): Date {
  const d = new Date(fromDate);
  d.setDate(mandateDay);
  // If the mandate day this month is still in the future, use it; otherwise advance to next month
  if (d <= fromDate) {
    d.setMonth(d.getMonth() + 1);
    d.setDate(mandateDay);
  }
  return d;
}

/** Returns the next occurrence of `dayOfWeek` (0=Sun…6=Sat) strictly after `fromDate`. */
function nextWeekdayAfter(fromDate: Date, dayOfWeek: number): Date {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + 1); // at least tomorrow
  while (d.getDay() !== dayOfWeek) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

function addMonthsSameDay(
  date: Date,
  months: number,
  mandateDay: number
): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  d.setDate(mandateDay);
  return d;
}

/** Compute total installments based on frequency and tenure. */
function computeTotalInstallments(
  debitFrequency: string,
  tenureMonths: number
): number {
  if (debitFrequency === 'daily') {
    return Math.round((tenureMonths * 365) / 12);
  }
  if (debitFrequency === 'weekly') {
    return Math.round((tenureMonths * 52) / 12);
  }
  return tenureMonths; // monthly
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get('userId');

    const isSelf = requestedUserId
      ? session.user.id === requestedUserId
      : false;

    if (!isSelf) {
      const accessResult = await requireAdminLikeAccess();
      if (!accessResult.ok) {
        // Not admin — fall back to own subscriptions only
        if (!requestedUserId || requestedUserId === session.user.id) {
          const ownSubscriptions = await RDSubscription.find({
            userId: session.user.id,
          })
            .populate('schemeId', 'name interestRate tenureMonths')
            .sort({ createdAt: -1 });
          return NextResponse.json({ success: true, data: ownSubscriptions });
        }
        return accessResult.response;
      }
      if (
        requestedUserId &&
        !canManageUser(accessResult.context, requestedUserId)
      ) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    // Admin with no userId filter → return all subscriptions
    const filter = requestedUserId
      ? { userId: requestedUserId }
      : isSelf
        ? { userId: session.user.id }
        : {};

    const subscriptions = await RDSubscription.find(filter)
      .populate('schemeId', 'name interestRate tenureMonths')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: subscriptions });
  } catch (err) {
    console.error('GET /api/rd-subscriptions error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await req.json();

    const targetUserId = String(body.userId || '').trim();
    const schemeId = String(body.schemeId || '').trim();
    const monthlyAmount = Number(body.monthlyAmount);
    const investmentType: 'sip' | 'one-time' =
      body.investmentType === 'one-time' ? 'one-time' : 'sip';
    const debitFrequency: 'daily' | 'weekly' | 'monthly' = [
      'daily',
      'weekly',
      'monthly',
    ].includes(body.debitFrequency)
      ? body.debitFrequency
      : 'monthly';
    const mandateDay = Number(body.mandateDay) || 1;
    const mandateDayOfWeek =
      body.mandateDayOfWeek != null ? Number(body.mandateDayOfWeek) : null;

    if (
      !targetUserId ||
      !schemeId ||
      Number.isNaN(monthlyAmount) ||
      monthlyAmount < 1
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription parameters.' },
        { status: 400 }
      );
    }

    // Validate mandate day for monthly SIP
    if (
      investmentType === 'sip' &&
      debitFrequency === 'monthly' &&
      (!Number.isInteger(mandateDay) || mandateDay < 1 || mandateDay > 28)
    ) {
      return NextResponse.json(
        { success: false, error: 'mandateDay must be 1–28 for monthly SIP.' },
        { status: 400 }
      );
    }

    // Validate day-of-week for weekly SIP
    if (
      investmentType === 'sip' &&
      debitFrequency === 'weekly' &&
      (mandateDayOfWeek === null ||
        mandateDayOfWeek < 0 ||
        mandateDayOfWeek > 6)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'mandateDayOfWeek must be 0–6 for weekly SIP.',
        },
        { status: 400 }
      );
    }

    const isSelf = session.user.id === targetUserId;

    if (!isSelf) {
      const accessResult = await requireAdminLikeAccess();
      if (!accessResult.ok) return accessResult.response;
      if (!canManageUser(accessResult.context, targetUserId)) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    // Fetch user and scheme
    const [user, scheme] = await Promise.all([
      User.findById(targetUserId).select(
        'features financeFeaturesEnabled name'
      ),
      RDScheme.findById(schemeId),
    ]);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    if (!scheme || !scheme.isActive) {
      return NextResponse.json(
        { success: false, error: 'Scheme not found or inactive' },
        { status: 404 }
      );
    }

    // Validate investment type is enabled on the scheme
    if (investmentType === 'one-time' && !scheme.allowOneTimeInvestment) {
      return NextResponse.json(
        {
          success: false,
          error: 'One-time investment is not available for this scheme',
        },
        { status: 400 }
      );
    }
    if (investmentType === 'sip' && !scheme.allowAutoDebit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Auto debit / SIP is not available for this scheme',
        },
        { status: 400 }
      );
    }

    // Feature flag check — only enforced for self-subscribe; admin can subscribe any user
    if (isSelf && !isFeatureEnabled(user, 'rdNewEnabled')) {
      return NextResponse.json(
        {
          success: false,
          error: 'RD Plans feature is not enabled for this user',
        },
        { status: 403 }
      );
    }

    // Validate amount bounds
    if (monthlyAmount < scheme.minMonthlyAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `monthlyAmount must be at least ${scheme.minMonthlyAmount}`,
        },
        { status: 400 }
      );
    }
    if (
      scheme.maxMonthlyAmount != null &&
      monthlyAmount > scheme.maxMonthlyAmount
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `monthlyAmount must not exceed ${scheme.maxMonthlyAmount}`,
        },
        { status: 400 }
      );
    }

    const now = new Date();

    // Compute maturity date (always based on tenure months from now)
    const maturityDate = new Date(now);
    maturityDate.setMonth(maturityDate.getMonth() + scheme.tenureMonths);

    let nextDebitDate: Date;
    let totalInstallments: number;

    if (investmentType === 'one-time') {
      // Immediately fund; nextDebitDate = maturityDate so cron pays out at maturity
      nextDebitDate = new Date(maturityDate);
      totalInstallments = 1;

      // Validate balance for immediate debit
      if (user.savingsBalance < monthlyAmount) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient savings balance for one-time investment',
          },
          { status: 400 }
        );
      }

      // Immediately debit the amount
      await User.findByIdAndUpdate(targetUserId, {
        $inc: { savingsBalance: -monthlyAmount },
      });

      const subscription = await RDSubscription.create({
        userId: targetUserId,
        schemeId,
        investmentType: 'one-time',
        debitFrequency: 'monthly', // irrelevant for one-time
        monthlyAmount,
        mandateDay: 1,
        mandateDayOfWeek: null,
        totalInstallments: 1,
        startDate: now,
        nextDebitDate,
        maturityDate,
        installmentsPaid: 1,
        totalDebited: monthlyAmount,
        accruedInterest: 0,
        status: 'active',
        missedInstallments: 0,
        lastDebitDate: now,
      });

      await Transaction.create({
        userId: targetUserId,
        type: 'rd_new',
        amount: monthlyAmount,
        date: now,
        metadata: {
          subscriptionId: subscription._id.toString(),
          schemeId: schemeId,
          installmentNumber: 1,
          totalInstallments: 1,
          totalDebited: monthlyAmount,
          accruedInterest: 0,
          investmentType: 'one-time',
        },
      });
      await Transaction.create({
        userId: targetUserId,
        type: 'withdrawal',
        amount: monthlyAmount,
        date: now,
      });

      return NextResponse.json(
        {
          success: true,
          data: subscription,
          message: 'One-time investment created',
        },
        { status: 201 }
      );
    }

    // SIP subscription
    if (debitFrequency === 'daily') {
      nextDebitDate = new Date(now);
      nextDebitDate.setDate(nextDebitDate.getDate() + 1);
      totalInstallments = computeTotalInstallments(
        'daily',
        scheme.tenureMonths
      );
    } else if (debitFrequency === 'weekly') {
      nextDebitDate = nextWeekdayAfter(now, mandateDayOfWeek ?? 1);
      totalInstallments = computeTotalInstallments(
        'weekly',
        scheme.tenureMonths
      );
    } else {
      // monthly
      nextDebitDate = nextMandateDayAfter(now, mandateDay);
      totalInstallments = scheme.tenureMonths;
    }

    const subscription = await RDSubscription.create({
      userId: targetUserId,
      schemeId,
      investmentType: 'sip',
      debitFrequency,
      monthlyAmount,
      mandateDay,
      mandateDayOfWeek:
        debitFrequency === 'weekly' ? (mandateDayOfWeek ?? 1) : null,
      totalInstallments,
      startDate: now,
      nextDebitDate,
      maturityDate,
      installmentsPaid: 0,
      totalDebited: 0,
      accruedInterest: 0,
      status: 'active',
      missedInstallments: 0,
    });

    return NextResponse.json(
      { success: true, data: subscription, message: 'Subscribed to RD scheme' },
      { status: 201 }
    );
  } catch (err) {
    console.error('POST /api/rd-subscriptions error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
