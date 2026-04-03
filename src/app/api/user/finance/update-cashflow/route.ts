import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { CashFlow } from '@/models/CashFlow';
import { enforceFinanceFeatureEnabled } from '@/lib/featureFlags';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

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
    } = body;

    const validPaymentSources = ['account', 'credit_card', 'cash'] as const;

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

    const nextType =
      type !== undefined ? type : (existing.type as 'income' | 'expense');

    const updates: Partial<Record<string, any>> = {};
    if (date !== undefined) updates.date = new Date(date);
    if (type !== undefined) updates.type = type;
    if (category !== undefined) updates.category = category;
    if (amount !== undefined) updates.amount = amount;
    if (source !== undefined) updates.source = source;
    if (note !== undefined) updates.note = note;

    let unsetPaymentSource = false;

    if (paymentSource !== undefined && nextType === 'expense') {
      if (paymentSource === null || paymentSource === '') {
        unsetPaymentSource = true;
      } else if (!validPaymentSources.includes(paymentSource)) {
        return NextResponse.json(
          { success: false, error: 'Invalid payment source' },
          { status: 400 }
        );
      } else {
        updates.paymentSource = paymentSource;
      }
    }

    updates.updatedAt = new Date();

    if (nextType === 'income') {
      delete updates.paymentSource;
    }

    const updatePayload: Record<string, unknown> = { $set: updates };
    const $unset: Record<string, string> = {};
    if (nextType === 'income') {
      $unset.paymentSource = '';
    }
    if (unsetPaymentSource) {
      $unset.paymentSource = '';
    }
    if (Object.keys($unset).length > 0) {
      updatePayload.$unset = $unset;
    }

    const updatedCashFlow = await CashFlow.findOneAndUpdate(
      { _id: cashflowId, user: user._id },
      updatePayload,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedCashFlow,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
