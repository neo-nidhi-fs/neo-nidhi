import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Challenge } from '@/models/Challenge';

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Fetch all challenges that are open for registration or already started
    const challenges = await Challenge.find({
      status: { $in: ['registration', 'started'] },
    })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    console.log('challenges ==> ', challenges);

    return NextResponse.json({
      success: true,
      data: challenges,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return NextResponse.json(
    { success: false, error: 'Only admins can create challenges' },
    { status: 403 }
  );
}
