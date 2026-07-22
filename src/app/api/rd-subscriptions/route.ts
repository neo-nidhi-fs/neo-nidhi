import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/dbConnect';
import { RDScheme } from '@/models/RDScheme';
import { RDSubscription } from '@/models/RDSubscription';
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
    const mandateDay = Number(body.mandateDay);

    if (
      !targetUserId ||
      !schemeId ||
      Number.isNaN(monthlyAmount) ||
      monthlyAmount < 1 ||
      !Number.isInteger(mandateDay) ||
      mandateDay < 1 ||
      mandateDay > 28
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid subscription parameters. mandateDay must be 1–28.',
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
    const nextDebitDate = nextMandateDayAfter(now, mandateDay);
    const maturityDate = addMonthsSameDay(
      nextDebitDate,
      scheme.tenureMonths - 1,
      mandateDay
    );

    const subscription = await RDSubscription.create({
      userId: targetUserId,
      schemeId,
      monthlyAmount,
      mandateDay,
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
