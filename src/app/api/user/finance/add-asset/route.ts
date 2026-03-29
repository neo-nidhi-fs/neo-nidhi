import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { enforceFinanceFeatureEnabled } from '@/lib/featureFlags';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
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

    // Validation
    if (
      !type ||
      !category ||
      amount === undefined ||
      marketValue === undefined
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount <= 0 || marketValue < 0) {
      return NextResponse.json(
        { success: false, error: 'Amount and market value must be valid' },
        { status: 400 }
      );
    }

    const validTypes = ['fd', 'rd', 'equity', 'mutual_fund', 'epfo', 'other'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid asset type: ${type}` },
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

    const newAsset = {
      type,
      category,
      amount,
      quantity: quantity || null,
      purchaseValue: purchaseValue || null,
      marketValue,
      symbolOrCode: symbolOrCode || null,
      startDate: startDate ? new Date(startDate) : null,
      metadata: metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user.assetPortfolio.push(newAsset as any);
    await user.save();

    // Get the created asset with ID from the saved user
    const createdAsset = user.assetPortfolio[user.assetPortfolio.length - 1];

    return NextResponse.json(
      {
        success: true,
        data: createdAsset,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
