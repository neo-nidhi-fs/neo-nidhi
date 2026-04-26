import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Budget } from '@/models/Budget';
import { enforceFinanceFeatureEnabled } from '@/lib/featureFlags';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';

function isValidMonth(month: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

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
    const { month, category, amount, note } = body;

    if (!month || !category || amount === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!isValidMonth(String(month))) {
      return NextResponse.json(
        { success: false, error: 'Month must be in YYYY-MM format' },
        { status: 400 }
      );
    }

    if (Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Budget amount must be greater than 0' },
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

    const normalizedCategory = String(category).trim();
    const normalizedMonth = String(month).trim();

    const existingBudget = await Budget.findOne({
      user: user._id,
      month: normalizedMonth,
      category: normalizedCategory,
    });

    if (existingBudget) {
      return NextResponse.json(
        {
          success: false,
          error: 'Budget already exists for this month and category',
        },
        { status: 409 }
      );
    }

    const createdBudget = await Budget.create({
      user: user._id,
      month: normalizedMonth,
      category: normalizedCategory,
      amount: Number(amount),
      note: note || null,
    });

    return NextResponse.json(
      { success: true, data: createdBudget },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
