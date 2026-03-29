import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { enforceFinanceFeatureEnabled } from '@/lib/featureFlags';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { cashflowId, date, type, category, amount, source, note } = body;

    if (!cashflowId) {
      return NextResponse.json(
        { success: false, error: 'Cashflow ID required' },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const featureFlagError = enforceFinanceFeatureEnabled(user);
    if (featureFlagError) {
      return featureFlagError;
    }

    // Ensure cashFlows array exists for backward compatibility
    if (!user.cashFlows) {
      user.cashFlows = [];
    }

    const cashflowIndex = user.cashFlows.findIndex(
      (c) => c._id.toString() === cashflowId
    );
    if (cashflowIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Cashflow not found' },
        { status: 404 }
      );
    }

    // Update cashflow fields if provided
    if (date !== undefined) user.cashFlows[cashflowIndex].date = new Date(date);
    if (type !== undefined) user.cashFlows[cashflowIndex].type = type;
    if (category !== undefined)
      user.cashFlows[cashflowIndex].category = category;
    if (amount !== undefined) user.cashFlows[cashflowIndex].amount = amount;
    if (source !== undefined) user.cashFlows[cashflowIndex].source = source;
    if (note !== undefined) user.cashFlows[cashflowIndex].note = note;

    user.cashFlows[cashflowIndex].updatedAt = new Date();

    await user.save();

    return NextResponse.json({
      success: true,
      data: user.cashFlows[cashflowIndex],
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
