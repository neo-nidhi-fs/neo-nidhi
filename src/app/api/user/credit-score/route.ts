import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Transaction } from '@/models/Transaction';
import { isFeatureEnabled } from '@/lib/userFeatures';
import { calculateInAppCreditScore } from '@/lib/creditScore';

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user.id).select('features financeFeaturesEnabled');
    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!isFeatureEnabled(user, 'creditScoreEnabled')) {
      return Response.json(
        { success: false, error: 'Credit score feature is disabled for this user' },
        { status: 403 }
      );
    }

    const transactions = await Transaction.find({
      userId: session.user.id,
      type: { $in: ['loan', 'repayment'] },
    }).select('type amount date');

    const scoreData = calculateInAppCreditScore(transactions);

    return Response.json({
      success: true,
      data: {
        ...scoreData,
        source: 'Calculated from in-app loan/repayment transactions only',
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to calculate credit score',
      },
      { status: 500 }
    );
  }
}

