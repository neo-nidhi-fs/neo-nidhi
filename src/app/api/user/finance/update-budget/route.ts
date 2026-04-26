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
    const { budgetId, month, category, amount, note } = body;

    if (!budgetId) {
      return NextResponse.json(
        { success: false, error: 'Budget ID required' },
        { status: 400 }
      );
    }

    if (month !== undefined && !isValidMonth(String(month))) {
      return NextResponse.json(
        { success: false, error: 'Month must be in YYYY-MM format' },
        { status: 400 }
      );
    }

    if (amount !== undefined && Number(amount) <= 0) {
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

    const existingBudget = await Budget.findOne({
      _id: budgetId,
      user: user._id,
    });

    if (!existingBudget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    const nextMonth =
      month !== undefined ? String(month).trim() : existingBudget.month;
    const nextCategory =
      category !== undefined ? String(category).trim() : existingBudget.category;

    const duplicate = await Budget.findOne({
      _id: { $ne: existingBudget._id },
      user: user._id,
      month: nextMonth,
      category: nextCategory,
    });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Another budget already exists for this month and category',
        },
        { status: 409 }
      );
    }

    const updatePayload: Record<string, unknown> = {};
    if (month !== undefined) updatePayload.month = nextMonth;
    if (category !== undefined) updatePayload.category = nextCategory;
    if (amount !== undefined) updatePayload.amount = Number(amount);
    if (note !== undefined) updatePayload.note = note || null;
    updatePayload.updatedAt = new Date();

    const updatedBudget = await Budget.findOneAndUpdate(
      { _id: budgetId, user: user._id },
      { $set: updatePayload },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatedBudget });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
