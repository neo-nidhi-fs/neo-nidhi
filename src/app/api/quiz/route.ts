import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { QuizQuestion } from '@/models/QuizQuestion';
import { QuizResult } from '@/models/QuizResult';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'finance';
    const count = parseInt(searchParams.get('count') || '10');

    // Get random questions from the category
    const questions = await QuizQuestion.aggregate([
      { $match: { category } },
      { $sample: { size: Math.min(count, 100) } },
      { $project: { correctAnswer: 0 } }, // Don't send correct answer to client
    ]);

    return NextResponse.json({
      success: true,
      data: questions,
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
    const { userId, category, answers } = body;

    if (!userId || !category || !answers) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get answered questions to verify
    const questionIds = answers.map(
      (a: { questionId: string }) => a.questionId
    );
    const questions = await QuizQuestion.find({ _id: { $in: questionIds } });

    let score = 0;
    let correctAnswers = 0;
    let totalPoints = 0;

    const answersWithResults = answers
      .map((answer: { questionId: string; selectedOption: number }) => {
        const question = questions.find(
          (q) => q._id.toString() === answer.questionId
        );
        if (!question) return null;

        const isCorrect = question.correctAnswer === answer.selectedOption;
        const points = isCorrect ? question.points : 0;

        if (isCorrect) {
          correctAnswers++;
          score += points;
        }
        totalPoints += question.points;

        return {
          questionId: question._id,
          selectedOption: answer.selectedOption,
          isCorrect,
          points,
        };
      })
      .filter(Boolean);

    // Save quiz result
    const result = await QuizResult.create({
      userId,
      category,
      score,
      totalPoints,
      correctAnswers,
      totalQuestions: answers.length,
      answers: answersWithResults,
    });

    return NextResponse.json({
      success: true,
      data: {
        score,
        correctAnswers,
        totalQuestions: answers.length,
        totalPoints,
        percentage: Math.round((score / totalPoints) * 100),
        resultId: result._id,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
