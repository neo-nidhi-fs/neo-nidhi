import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Challenge } from '@/models/Challenge';
import { ChallengeParticipant } from '@/models/ChallengeParticipant';
import { User } from '@/models/User';
import { Transaction } from '@/models/Transaction';

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

    if (challenge.status !== 'started') {
      return NextResponse.json(
        { success: false, error: 'Challenge is not in started status' },
        { status: 400 }
      );
    }

    // Get all registered participants
    const participants = await ChallengeParticipant.find({
      challengeId: id,
      status: 'completed',
    });

    if (participants.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No participants finish challenge' },
        { status: 400 }
      );
    }

    function findWinners() {
      // Sort participants by score in descending order
      const sorted = [...participants].sort((a, b) => b.score - a.score);
      console.log('sorted ==> ', sorted);

      const registrationFee = challenge?.registrationFee || 0;
      const totalPrizePool = registrationFee * participants.length;
      console.log('totalPrizePool ==> ', totalPrizePool);
      const priceShare = [50, 30, 20]; // 50% for 1st, 30% for 2nd, 20% for 3rd

      const getWinnerData = (participant, position) => ({
        position,
        userId: participant?.userId,
        score: participant?.score,
        reward: (totalPrizePool * priceShare[position - 1]) / 100,
      });

      if (sorted.length >= 3) {
        return [
          getWinnerData(sorted[0], 1),
          getWinnerData(sorted[1], 2),
          getWinnerData(sorted[2], 3),
        ];
      }
      return sorted.map((participant, index) =>
        getWinnerData(participant, index + 1)
      );
    }
    const winners = findWinners();
    console.log('winners ==> ', winners);

    // Update challenge status
    challenge.status = 'completed';
    challenge.updatedAt = new Date();
    challenge.winners = winners;

    await challenge.save();
    // winners will get respective rewards based on their position and total prize pool
    winners.forEach(async (winner) => {
      await User.findOneAndUpdate(
        { _id: winner.userId },
        { $inc: { savingsBalance: winner.reward } }
      );
      await Transaction.create({
        userId: winner.userId,
        type: 'challenge_reward',
        amount: winner.reward,
        date: new Date(),
      });
    });

    return NextResponse.json({
      success: true,
      message: `Challenge completed! Fees deducted from ${participants.length} participants`,
      data: challenge,
    });
  } catch (error: unknown) {
    console.log('error ==> ', error);

    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
