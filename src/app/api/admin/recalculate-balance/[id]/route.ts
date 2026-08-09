import { User } from '@/models/User';
import { recalculateBalances } from '@/utils/recalculateBalance';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    const newBalances = await recalculateBalances(id);
    // Update user balances
    user.savingsBalance = newBalances.savingsBalance;
    user.fd = newBalances.fdBalance;
    user.rd = newBalances.rdBalance;
    user.loanBalance = newBalances.loanBalance;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'balance calculated successfully',
    });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A scheme with this name already exists' },
        { status: 409 }
      );
    }
    console.error('GET /api/admin/recalculate-balance/[id] error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
