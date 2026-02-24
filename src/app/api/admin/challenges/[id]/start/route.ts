import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Challenge } from '@/models/Challenge';
import { Transaction } from '@/models/Transaction';
import { ChallengeParticipant } from '@/models/ChallengeParticipant';
import { User } from '@/models/User';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;

    const challenge = await Challenge.findById(id);
    console.log('challenge ==> ', challenge);
    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      );
    }

    if (challenge.status !== 'registration') {
      return NextResponse.json(
        { success: false, error: 'Challenge is not in registration status' },
        { status: 400 }
      );
    }

    // Get all registered participants
    const participants = await ChallengeParticipant.find({
      challengeId: id,
      status: 'registered',
    });

    if (participants.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No participants to start challenge' },
        { status: 400 }
      );
    }

    // Deduct registration fees from participants' savings accounts
    for (const participant of participants) {
      const user = await User.findById(participant.userId);
      if (user) {
        user.savingsBalance -= participant.registrationFee;
        await user.save();
        const transaction = new Transaction({
          userId: participant.userId,
          type: 'challenge_fee',
          amount: participant.registrationFee,
          date: new Date(),
        });
        await transaction.save();
      }

      // Update participant status to 'started'
      participant.status = 'started';
      participant.startedAt = new Date();
      await participant.save();
    }

    // Update challenge status
    challenge.status = 'started';
    challenge.startDate = new Date();
    challenge.endDate = new Date(
      Date.now() + challenge.durationMinutes * 60 * 1000
    );
    await challenge.save();

    return NextResponse.json({
      success: true,
      message: `Challenge started! Fees deducted from ${participants.length} participants`,
      data: challenge,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
