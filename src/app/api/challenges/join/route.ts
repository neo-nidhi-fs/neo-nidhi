import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Challenge } from '@/models/Challenge';
import { ChallengeParticipant } from '@/models/ChallengeParticipant';
import { User } from '@/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { challengeId, userId } = body;

    if (!challengeId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get challenge
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Check if challenge is active
    if (challenge.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Challenge is not active' },
        { status: 400 }
      );
    }

    // Check if max participants reached
    if (challenge.currentParticipants >= challenge.maxParticipants) {
      return NextResponse.json(
        { success: false, error: 'Challenge is full' },
        { status: 400 }
      );
    }

    // Check if user already joined
    const existing = await ChallengeParticipant.findOne({
      challengeId,
      userId,
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You already joined this challenge' },
        { status: 400 }
      );
    }

    // Check user has sufficient balance
    const user = await User.findById(userId);
    if (!user || user.savingsBalance < challenge.registrationFee) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance for registration' },
        { status: 400 }
      );
    }

    // Deduct registration fee from user
    await User.findByIdAndUpdate(userId, {
      $inc: { savingsBalance: -challenge.registrationFee },
    });

    // Add participant
    const participant = await ChallengeParticipant.create({
      challengeId,
      userId,
      registrationFee: challenge.registrationFee,
    });

    // Update challenge
    await Challenge.findByIdAndUpdate(challengeId, {
      $inc: { currentParticipants: 1 },
      $push: { participants: userId },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully joined challenge. Registration fee: ₹${challenge.registrationFee}`,
      data: participant,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
