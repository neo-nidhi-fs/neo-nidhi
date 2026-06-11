import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { CashFlow } from '@/models/CashFlow';
import { enforceFinanceFeatureEnabled } from '@/lib/featureFlags';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';
import { getNetWorthSummary, getAssetBreakdown } from '@/lib/networth';

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
      .select(
        'savingsBalance fd rd loanBalance assetPortfolio liabilities features financeFeaturesEnabled'
      )
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
      .select('date type category amount source liabilityId paymentSource note')
      .sort({ date: -1 })
      .lean();

    const netWorthData = getNetWorthSummary(user, cashFlows);
    const assetBreakdown = getAssetBreakdown(user);

    return NextResponse.json({
      success: true,
      data: {
        summary: netWorthData,
        assetBreakdown,
        liabilityBreakdown: {
          loans: user.loanBalance,
          portfolio: (user.liabilities || []).reduce(
            (sum: number, liability) => sum + (liability.amount || 0),
            0
          ),
          byType: (user.liabilities || []).reduce(
            (acc: { [key: string]: number }, liability) => {
              if (!acc[liability.type]) {
                acc[liability.type] = 0;
              }
              acc[liability.type] += liability.amount || 0;
              return acc;
            },
            {}
          ),
        },
        assets: user.assetPortfolio || [],
        liabilities: user.liabilities || [],
        recentCashFlows: cashFlows.slice(0, 10),
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
