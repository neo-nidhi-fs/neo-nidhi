import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Challenge } from '@/models/Challenge';
import { ChallengeParticipant } from '@/models/ChallengeParticipant';
import { User } from '@/models/User';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { challengeId } = body;

    if (!challengeId) {
      return NextResponse.json(
        { success: false, error: 'Challenge ID required' },
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

    // Get all participants sorted by score
    const participants = await ChallengeParticipant.find({ challengeId })
      .sort({ score: -1 })
      .limit(3)
      .populate('userId', 'name');

    if (participants.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No participants found' },
        { status: 400 }
      );
    }

    // Calculate rewards
    const totalPrizePool =
      challenge.registrationFee * challenge.currentParticipants;
    const adminShare = Math.floor(totalPrizePool * 0.1); // 10% for admin
    const availableReward = totalPrizePool - adminShare;

    const rewards = [
      Math.floor(availableReward * 0.5), // 50% for 1st
      Math.floor(availableReward * 0.3), // 30% for 2nd
      Math.floor(availableReward * 0.2), // 20% for 3rd (10% + remaining)
    ];

    // Update winners in challenge
    interface Winner {
      position: number;
      userId:
        | mongoose.Types.ObjectId
        | { _id: mongoose.Types.ObjectId; name: string };
      score: number;
      reward: number;
      userName?: string;
    }

    const winners: Winner[] = [];

    for (let i = 0; i < Math.min(participants.length, 3); i++) {
      const participant = participants[i];
      const reward = rewards[i];

      // Update participant reward
      await ChallengeParticipant.findByIdAndUpdate(participant._id, {
        position: i + 1,
        reward,
        completedAt: new Date(),
      });

      // Add reward to user's savings
      await User.findByIdAndUpdate(participant.userId, {
        $inc: { savingsBalance: reward },
      });

      const userObj = participant.userId as unknown as {
        _id: mongoose.Types.ObjectId;
        name: string;
      };
      winners.push({
        position: i + 1,
        userId: participant.userId,
        score: participant.score,
        reward,
        userName: userObj.name,
      });
    }

    // Update challenge as completed
    await Challenge.findByIdAndUpdate(challengeId, {
      status: 'completed',
      winners: winners.map((w) => ({
        position: w.position,
        userId: w.userId,
        score: w.score,
        reward: w.reward,
      })),
      totalPrizePool,
    });

    return NextResponse.json({
      success: true,
      message: 'Challenge completed and rewards distributed',
      data: {
        winners: winners.map((w) => ({
          position: w.position,
          userId: w.userId,
          userName: w.userName,
          score: w.score,
          reward: w.reward,
        })),
        totalPrizePool,
        adminShare,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get('challengeId');

    if (!challengeId) {
      return NextResponse.json(
        { success: false, error: 'Challenge ID required' },
        { status: 400 }
      );
    }

    const participants = await ChallengeParticipant.find({ challengeId })
      .populate('userId', 'name')
      .sort({ score: -1 });

    return NextResponse.json({
      success: true,
      data: participants,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
