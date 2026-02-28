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
    const { newMPin, oldMPin } = body;
    const { id } = await context.params;
    const userId = id;

    if (!newMPin || newMPin.length !== 4 || !/^\d+$/.test(newMPin)) {
      return NextResponse.json(
        { success: false, error: 'MPIN must be 4 digits' },
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

    // If user already has MPIN, verify old MPIN
    if (user.mpin && oldMPin) {
      const isValid = await user.compareMPin(oldMPin);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid old MPIN' },
          { status: 400 }
        );
      }
    } else if (user.mpin && !oldMPin) {
      return NextResponse.json(
        { success: false, error: 'Old MPIN required to change MPIN' },
        { status: 400 }
      );
    }

    // Update MPIN
    user.mpin = newMPin;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'MPIN set successfully',
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
