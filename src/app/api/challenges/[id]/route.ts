import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Challenge } from '@/models/Challenge';

import { QuizQuestion } from '@/models/QuizQuestion';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Get random questions for this challenge
    const questions = await QuizQuestion.aggregate([
      { $match: { category: challenge.category } },
      { $sample: { size: Math.min(challenge.questionCount, 100) } },
      { $project: { correctAnswer: 0 } }, // Don't send correct answers
    ]);

    return NextResponse.json({
      success: true,
      challenge: {
        _id: challenge._id,
        title: challenge.title,
        description: challenge.description,
        totalPrizePool: challenge.totalPrizePool,
        registrationFee: challenge.registrationFee,
      },
      questions,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
