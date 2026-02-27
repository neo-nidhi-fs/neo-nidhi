import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { QuizQuestion } from '@/models/QuizQuestion';

export async function GET() {
  try {
    await dbConnect();
    const categories = await QuizQuestion.distinct('subCategory');

    return NextResponse.json({
      success: true,
      data: categories.sort(),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
