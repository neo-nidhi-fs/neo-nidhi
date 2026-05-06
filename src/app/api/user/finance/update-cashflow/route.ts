import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { CashFlow } from '@/models/CashFlow';
import { Budget } from '@/models/Budget';
import { enforceFinanceFeatureEnabled } from '@/lib/featureFlags';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

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
    const {
      cashflowId,
      date,
      type,
      category,
      amount,
      source,
      note,
      paymentSource,
      liabilityId,
    } = body;

    const validPaymentSources = [
      'account',
      'cash',
      'card',
      'wallet',
      'credit_card',
    ] as const;

    if (!cashflowId) {
      return NextResponse.json(
        { success: false, error: 'Cashflow ID required' },
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

    const existing = await CashFlow.findOne({
      _id: cashflowId,
      user: user._id,
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Cashflow not found' },
        { status: 404 }
      );
    }

    const updates: Partial<Record<string, unknown>> = {};
    if (date !== undefined) updates.date = new Date(date);
    if (type !== undefined) updates.type = type;
    if (category !== undefined) updates.category = category;
    if (amount !== undefined) updates.amount = amount;
    if (source !== undefined) updates.source = source;
    if (note !== undefined) updates.note = note;
    if (liabilityId !== undefined) {
      const effectiveType = (type ?? existing.type) as string;
      if (liabilityId && effectiveType !== 'expense') {
        return NextResponse.json(
          { success: false, error: 'Liability linked payments must be expenses' },
          { status: 400 }
        );
      }
      updates.liabilityId = liabilityId || null;
    }

    const existingPaymentSource = existing.paymentSource || 'account';
    const resolvedPaymentSourceInput =
      paymentSource === undefined ? existingPaymentSource : paymentSource;

    if (resolvedPaymentSourceInput == null || resolvedPaymentSourceInput === '') {
      return NextResponse.json(
        { success: false, error: 'Payment type is required' },
        { status: 400 }
      );
    }

    if (!validPaymentSources.includes(resolvedPaymentSourceInput)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment source' },
        { status: 400 }
      );
    }
    updates.paymentSource =
      resolvedPaymentSourceInput === 'credit_card'
        ? 'card'
        : resolvedPaymentSourceInput;

    updates.updatedAt = new Date();

    const updatePayload: Record<string, unknown> = { $set: updates };

    const updatedCashFlow = await CashFlow.findOneAndUpdate(
      { _id: cashflowId, user: user._id },
      updatePayload,
      { new: true }
    );

    let budgetStatus: {
      hasBudget: boolean;
      month: string;
      category: string;
      budgetAmount: number;
      spent: number;
      remaining: number;
      usagePercent: number;
      isOverflow: boolean;
    } | null = null;

    if (updatedCashFlow?.type === 'expense') {
      const month = new Date(updatedCashFlow.date).toISOString().slice(0, 7);
      const normalizedCategory = String(updatedCashFlow.category).trim();
      const budget = await Budget.findOne({
        user: user._id,
        month,
        category: normalizedCategory,
      });

      if (budget) {
        const monthStart = new Date(`${month}-01T00:00:00.000Z`);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const [spentResult] = await CashFlow.aggregate<{ spent: number }>([
          {
            $match: {
              user: new mongoose.Types.ObjectId(String(user._id)),
              type: 'expense',
              category: normalizedCategory,
              date: {
                $gte: monthStart,
                $lt: monthEnd,
              },
            },
          },
          { $group: { _id: null, spent: { $sum: '$amount' } } },
        ]);

        const spent = spentResult?.spent || 0;
        const remaining = budget.amount - spent;
        budgetStatus = {
          hasBudget: true,
          month,
          category: normalizedCategory,
          budgetAmount: budget.amount,
          spent,
          remaining,
          usagePercent: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
          isOverflow: remaining < 0,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedCashFlow,
      budgetStatus,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
