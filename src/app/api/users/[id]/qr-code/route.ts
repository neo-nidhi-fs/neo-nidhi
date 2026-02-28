import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const QRCode = require('qrcode');

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const userId = id;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate QR code data - contains user ID and name for UPI-like transfer
    const qrData = JSON.stringify({
      userId: user._id,
      userName: user.name,
      type: 'transfer',
    });

    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      errorCorrectionLevel: 'H',
    });

    // Update user's QR code
    user.qrCode = qrCodeUrl;
    await user.save();

    return NextResponse.json({
      success: true,
      data: {
        qrCode: qrCodeUrl,
        userId: user._id,
        userName: user.name,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
