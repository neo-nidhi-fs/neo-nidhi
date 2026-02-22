import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { QuizResult } from '@/models/QuizResult';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'finance';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get top scorers by category
    const leaderboard = await QuizResult.aggregate([
      { $match: { category } },
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: '$score' },
          lastAttempt: { $max: '$completedAt' },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          userId: '$_id',
          userName: { $arrayElemAt: ['$user.name', 0] },
          totalScore: 1,
          totalAttempts: 1,
          avgScore: 1,
          lastAttempt: 1,
          _id: 0,
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: leaderboard,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
