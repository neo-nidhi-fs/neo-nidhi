import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Challenge } from '@/models/Challenge';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'active';
    const category = searchParams.get('category');

    const query: Record<string, string | null> = { status };
    if (category) query.category = category;

    const challenges = await Challenge.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

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
  try {
    await dbConnect();
    const body = await req.json();
    const {
      userId,
      title,
      description,
      category,
      registrationFee,
      maxParticipants,
      startDate,
      endDate,
    } = body;

    if (!userId || !title || !registrationFee || !maxParticipants) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const challenge = await Challenge.create({
      title,
      description,
      category: category || 'finance',
      registrationFee,
      maxParticipants,
      createdBy: userId,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      totalPrizePool: registrationFee * maxParticipants,
    });

    return NextResponse.json({
      success: true,
      message: 'Challenge created successfully',
      data: challenge,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
