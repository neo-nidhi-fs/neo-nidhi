import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { enforceFinanceFeatureEnabled } from '@/lib/featureFlags';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

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
    const {
      type,
      amount,
      interestRate,
      startDate,
      termMonths,
      additionalCharges,
      dueDate,
      status,
      metadata,
    } = body;

    // Validation
    if (!type || amount === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
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

    const initialStartDate = startDate ? new Date(startDate) : null;
    const initialTermMonths = termMonths || 0;

    let computedDueDate = dueDate ? new Date(dueDate) : null;
    if (!computedDueDate && initialStartDate && initialTermMonths > 0) {
      computedDueDate = new Date(initialStartDate);
      computedDueDate.setMonth(computedDueDate.getMonth() + initialTermMonths);
    }

    const newLiability = {
      type,
      amount,
      interestRate: interestRate || null,
      dueDate: computedDueDate,
      status: status || 'active',
      metadata: {
        ...metadata,
        startDate: initialStartDate || null,
        termMonths: initialTermMonths,
        additionalCharges: additionalCharges || 0,
        originalAmount: amount,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user.liabilities.push(newLiability as any);
    await user.save();

    // Get the created liability with ID from the saved user
    const createdLiability = user.liabilities[user.liabilities.length - 1];

    return NextResponse.json(
      {
        success: true,
        data: createdLiability,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
