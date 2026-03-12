import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';

// GET user's custom interest rates
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await context.params;

    const user = await User.findById(id).select('customInterestRates');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user.customInterestRates,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// PUT/PATCH user's custom interest rates (admin only)
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await context.params;
    const body = await req.json();

    // Validate input
    const { saving, fd, loan } = body;

    if (typeof saving !== 'number' && saving !== null && saving !== undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid saving rate. Must be a number or null.',
        },
        { status: 400 }
      );
    }

    if (typeof fd !== 'number' && fd !== null && fd !== undefined) {
      return NextResponse.json(
        { success: false, error: 'Invalid FD rate. Must be a number or null.' },
        { status: 400 }
      );
    }

    if (typeof loan !== 'number' && loan !== null && loan !== undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid loan rate. Must be a number or null.',
        },
        { status: 400 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update custom interest rates
    const customInterestRates: Record<string, number | null | undefined> = {
      ...user.customInterestRates,
    };

    if (saving !== undefined) {
      customInterestRates.saving = saving;
    }
    if (fd !== undefined) {
      customInterestRates.fd = fd;
    }
    if (loan !== undefined) {
      customInterestRates.loan = loan;
    }

    user.customInterestRates = customInterestRates;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        data: user.customInterestRates,
        message: 'Custom interest rates updated successfully',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// DELETE user's custom interest rates (admin only - revert to defaults)
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await context.params;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Reset custom interest rates
    user.customInterestRates = {};
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Custom interest rates removed. User will use default rates.',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
