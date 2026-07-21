import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/dbConnect';
import { RDSubscription } from '@/models/RDSubscription';
import { requireAdminLikeAccess, canManageUser } from '@/lib/adminAccess';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const subscription = await RDSubscription.findById(id).populate(
      'schemeId',
      'name interestRate tenureMonths minMonthlyAmount maxMonthlyAmount'
    );

    if (!subscription) {
      return NextResponse.json({ success: false, error: 'Subscription not found' }, { status: 404 });
    }

    const isSelf = session.user.id === subscription.userId.toString();
    if (!isSelf) {
      const accessResult = await requireAdminLikeAccess();
      if (!accessResult.ok) return accessResult.response;
      if (!canManageUser(accessResult.context, subscription.userId.toString())) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, data: subscription });
  } catch (err) {
    console.error('GET /api/rd-subscriptions/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
