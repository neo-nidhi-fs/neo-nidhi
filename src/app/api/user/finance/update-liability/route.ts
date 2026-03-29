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
    const {
      liabilityId,
      type,
      amount,
      interestRate,
      dueDate,
      status,
      metadata,
    } = body;

    if (!liabilityId) {
      return NextResponse.json(
        { success: false, error: 'Liability ID required' },
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

    // Ensure liabilities array exists for backward compatibility
    if (!user.liabilities) {
      user.liabilities = [];
    }

    const liabilityIndex = user.liabilities.findIndex(
      (l) => l._id.toString() === liabilityId
    );
    if (liabilityIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Liability not found' },
        { status: 404 }
      );
    }

    // Update liability fields if provided
    if (type !== undefined) user.liabilities[liabilityIndex].type = type;
    if (amount !== undefined) user.liabilities[liabilityIndex].amount = amount;
    if (interestRate !== undefined)
      user.liabilities[liabilityIndex].interestRate = interestRate;
    if (dueDate !== undefined)
      user.liabilities[liabilityIndex].dueDate = dueDate
        ? new Date(dueDate)
        : undefined;
    if (status !== undefined) user.liabilities[liabilityIndex].status = status;
    if (metadata !== undefined)
      user.liabilities[liabilityIndex].metadata = metadata;

    user.liabilities[liabilityIndex].updatedAt = new Date();

    await user.save();

    return NextResponse.json({
      success: true,
      data: user.liabilities[liabilityIndex],
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
