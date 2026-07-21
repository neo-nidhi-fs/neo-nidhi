import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { RDSubscription } from '@/models/RDSubscription';
import { Transaction } from '@/models/Transaction';
import { User } from '@/models/User';
import { requireAdminLikeAccess } from '@/lib/adminAccess';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessResult = await requireAdminLikeAccess();
    if (!accessResult.ok) return accessResult.response;

    await dbConnect();
    const { id } = await params;

    const subscription = await RDSubscription.findById(id).populate('schemeId', 'name');
    if (!subscription) {
      return NextResponse.json({ success: false, error: 'Subscription not found' }, { status: 404 });
    }

    if (!['active', 'missed'].includes(subscription.status)) {
      return NextResponse.json(
        { success: false, error: `Cannot close subscription with status '${subscription.status}'` },
        { status: 409 }
      );
    }

    const maturityAmount = subscription.totalDebited + subscription.accruedInterest;
    const now = new Date();

    // Credit savings atomically
    const updatedUser = await User.findByIdAndUpdate(
      subscription.userId,
      { $inc: { savingsBalance: maturityAmount } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Mark subscription closed
    await RDSubscription.findByIdAndUpdate(id, {
      status: 'closed',
      closedAt: now,
      closedBy: accessResult.context.actorId,
      maturityAmount,
      maturityTransferredAt: now,
    });

    // Create maturity transaction
    await Transaction.create({
      userId: subscription.userId,
      type: 'rd_new_maturity',
      amount: maturityAmount,
      date: now,
      metadata: {
        subscriptionId: id,
        source: 'manual_close',
        closedBy: accessResult.context.actorId,
        principal: subscription.totalDebited,
        interest: subscription.accruedInterest,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Subscription closed. ₹${maturityAmount.toFixed(2)} credited to savings.`,
      data: {
        maturityAmount,
        newSavingsBalance: updatedUser.savingsBalance,
      },
    });
  } catch (err) {
    console.error('POST /api/rd-subscriptions/[id]/close error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
