import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { enforceFinanceFeatureEnabled } from '@/lib/featureFlags';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
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
    const { assetId } = body;

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

    user.assetPortfolio.splice(assetIndex, 1);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
