import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { QuizResult } from '@/models/QuizResult';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    await dbConnect();
    const { userId } = params;
    const objectId = new mongoose.Types.ObjectId(userId);

    // Get user's quiz stats
    const stats = await QuizResult.aggregate([
      { $match: { userId: objectId } },
      {
        $group: {
          _id: '$category',
          totalScore: { $sum: '$score' },
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: '$score' },
          bestScore: { $max: '$score' },
        },
      },
    ]);

    const totalStats = await QuizResult.aggregate([
      { $match: { userId: objectId } },
      {
        $group: {
          _id: null,
          overallScore: { $sum: '$score' },
          totalAttempts: { $sum: 1 },
          totalQuestions: { $sum: '$totalQuestions' },
          totalCorrect: { $sum: '$correctAnswers' },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        byCategory: stats,
        overall: totalStats[0] || {
          overallScore: 0,
          totalAttempts: 0,
          totalQuestions: 0,
          totalCorrect: 0,
        },
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
