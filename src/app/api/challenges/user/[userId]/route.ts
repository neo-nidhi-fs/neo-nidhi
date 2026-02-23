import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ChallengeParticipant } from '@/models/ChallengeParticipant';

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await dbConnect();
    const { userId } = await context.params;

    const participations = await ChallengeParticipant.find({
      userId,
    }).select('challengeId status');

    const data = participations.map((p) => ({
      challengeId: p.challengeId.toString(),
      status: p.status,
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
