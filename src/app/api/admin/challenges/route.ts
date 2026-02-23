import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Challenge } from '@/models/Challenge';

export async function GET() {
  try {
    await dbConnect();

    const challenges = await Challenge.find()
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
      createdBy,
      title,
      description,
      category,
      questionCount,
      registrationFee,
      maxParticipants,
      totalPrizePool,
      durationMinutes,
    } = body;

    if (
      !createdBy ||
      !title ||
      registrationFee === undefined ||
      !maxParticipants
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const challengeData = {
      createdBy,
      title,
      description: description || '',
      category: category || 'finance',
      questionCount: questionCount || 10,
      registrationFee,
      maxParticipants,
      totalPrizePool: totalPrizePool || 0,
      durationMinutes: durationMinutes || 30,
      status: 'registration' as const,
    };

    const challenge = await Challenge.create(challengeData);

    return NextResponse.json({
      success: true,
      data: challenge,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Challenge ID required' },
        { status: 400 }
      );
    }

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      );
    }

    if (challenge.status !== 'registration') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot edit started or completed challenges',
        },
        { status: 400 }
      );
    }

    const updated = await Challenge.findByIdAndUpdate(id, body, {
      new: true,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Challenge ID required' },
        { status: 400 }
      );
    }

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      );
    }

    if (challenge.currentParticipants > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete challenges with participants' },
        { status: 400 }
      );
    }

    await Challenge.deleteOne({ _id: id });

    return NextResponse.json({
      success: true,
      message: 'Challenge deleted',
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
