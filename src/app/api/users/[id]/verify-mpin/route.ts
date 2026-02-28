import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const body = await req.json();
    const { mpin } = body;
    const { id } = await context.params;
    const userId = id;

    if (!mpin) {
      return NextResponse.json(
        { success: false, error: 'MPIN required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.mpin) {
      return NextResponse.json(
        { success: false, error: 'MPIN not set' },
        { status: 400 }
      );
    }

    // Verify MPIN
    const isValid = await user.compareMPin(mpin);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid MPIN' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'MPIN verified',
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
