import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { Budget } from '@/models/Budget';
import { CashFlow } from '@/models/CashFlow';
import { enforceFinanceFeatureEnabled } from '@/lib/featureFlags';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

function monthToRange(month: string) {
  const [yearRaw, monthRaw] = month.split('-');
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw) - 1;
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 1);
  return { start, end };
}

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const monthFilter =
      month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? { month } : {};

    const budgets = await Budget.find({
      user: user._id,
      ...monthFilter,
    }).sort({ month: -1, category: 1 });

    const userObjectId = new mongoose.Types.ObjectId(String(user._id));
    const expenseAgg = await CashFlow.aggregate<{
      _id: { month: string; category: string };
      spent: number;
    }>([
      { $match: { user: userObjectId, type: 'expense' } },
      {
        $project: {
          category: 1,
          amount: 1,
          month: { $dateToString: { format: '%Y-%m', date: '$date' } },
        },
      },
      {
        $group: {
          _id: { month: '$month', category: '$category' },
          spent: { $sum: '$amount' },
        },
      },
    ]);

    const spentMap = new Map<string, number>();
    expenseAgg.forEach((item) => {
      spentMap.set(`${item._id.month}::${item._id.category}`, item.spent);
    });

    const enrichedBudgets = budgets.map((budget) => {
      const budgetObj = budget.toObject();
      const spent =
        spentMap.get(`${budgetObj.month}::${budgetObj.category}`) || 0;
      const remaining = budgetObj.amount - spent;
      const usagePercent =
        budgetObj.amount > 0 ? (spent / budgetObj.amount) * 100 : 0;

      return {
        ...budgetObj,
        spent,
        remaining,
        usagePercent,
        isOverflow: remaining < 0,
      };
    });

    const targetMonth =
      month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)
        ? month
        : new Date().toISOString().slice(0, 7);

    const monthBudgets = enrichedBudgets.filter((b) => b.month === targetMonth);
    const totalBudget = monthBudgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = monthBudgets.reduce((sum, b) => sum + b.spent, 0);
    const overflowCount = monthBudgets.filter((b) => b.isOverflow).length;
    const remainingBudget = totalBudget - totalSpent;

    const monthExpensesByCategory = await CashFlow.aggregate<{
      _id: string;
      total: number;
    }>([
      {
        $match: {
          user: userObjectId,
          type: 'expense',
          date: {
            $gte: monthToRange(targetMonth).start,
            $lt: monthToRange(targetMonth).end,
          },
        },
      },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          budgets: enrichedBudgets,
          summary: {
            month: targetMonth,
            totalBudget,
            totalSpent,
            remainingBudget,
            overflowCount,
          },
          monthExpensesByCategory,
        },
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
