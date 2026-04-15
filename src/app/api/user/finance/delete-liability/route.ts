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
    const { liabilityId } = body;

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

    user.liabilities.splice(liabilityIndex, 1);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Liability deleted successfully',
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
