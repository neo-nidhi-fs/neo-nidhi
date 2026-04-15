import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { enforceFinanceFeatureEnabled } from '@/lib/featureFlags';
import { calculateLoanProjection } from '@/lib/networth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
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
    const liabilitiesWithProjections = (user.liabilities || []).map(
      (liability) => ({
        ...liability.toObject(),
        projection: calculateLoanProjection(liability),
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: liabilitiesWithProjections,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
