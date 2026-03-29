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
      assetId,
      type,
      category,
      amount,
      quantity,
      purchaseValue,
      marketValue,
      symbolOrCode,
      startDate,
      metadata,
    } = body;

    if (!assetId) {
      return NextResponse.json(
        { success: false, error: 'Asset ID required' },
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

    // Ensure assetPortfolio array exists for backward compatibility
    if (!user.assetPortfolio) {
      user.assetPortfolio = [];
    }

    const assetIndex = user.assetPortfolio.findIndex(
      (a) => a._id.toString() === assetId
    );
    if (assetIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Update asset fields if provided
    if (type !== undefined) user.assetPortfolio[assetIndex].type = type;
    if (category !== undefined)
      user.assetPortfolio[assetIndex].category = category;
    if (amount !== undefined) user.assetPortfolio[assetIndex].amount = amount;
    if (quantity !== undefined)
      user.assetPortfolio[assetIndex].quantity = quantity;
    if (purchaseValue !== undefined)
      user.assetPortfolio[assetIndex].purchaseValue = purchaseValue;
    if (marketValue !== undefined)
      user.assetPortfolio[assetIndex].marketValue = marketValue;
    if (symbolOrCode !== undefined)
      user.assetPortfolio[assetIndex].symbolOrCode = symbolOrCode;
    if (startDate !== undefined)
      user.assetPortfolio[assetIndex].startDate = startDate
        ? new Date(startDate)
        : undefined;
    if (metadata !== undefined)
      user.assetPortfolio[assetIndex].metadata = metadata;

    user.assetPortfolio[assetIndex].updatedAt = new Date();

    await user.save();

    return NextResponse.json({
      success: true,
      data: user.assetPortfolio[assetIndex],
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
