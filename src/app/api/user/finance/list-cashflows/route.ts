import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { CashFlow } from '@/models/CashFlow';
import { enforceFinanceFeatureEnabled } from '@/lib/featureFlags';
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

    const user = await User.findById(session.user.id)
      .select('_id features financeFeaturesEnabled')
      .lean();
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

    const cashFlows = await CashFlow.find({ user: user._id })
      .select(
        'user date type category amount source liabilityId paymentSource note smsFingerprint smsDeviceTimeMs smsReferenceKeys createdAt updatedAt'
      )
      .sort({ date: -1 })
      .lean();

    const normalizedCashFlows = cashFlows.map((cashFlow) => {
      const source = cashFlow.paymentSource;
      return {
        ...cashFlow,
        paymentSource:
          source === 'credit_card'
            ? 'card'
            : source || 'account',
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: normalizedCashFlows,
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
