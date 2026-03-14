import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { QuizQuestion } from '@/models/QuizQuestion';
import { QuizResult } from '@/models/QuizResult';
import { Types, type PipelineStage } from 'mongoose';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'finance';
    const count = parseInt(searchParams.get('count') || '10');
    const review = searchParams.get('review') === 'true';
    const questionIdsParam = searchParams.get('questionIds');
    const subCategory = searchParams.get('subCategory');
    const userId = searchParams.get('userId');

    let questions;

    if (questionIdsParam && review) {
      // Fetch specific questions by IDs (for review)
      const questionIds = questionIdsParam
        .split(',')
        .map((id) => new Types.ObjectId(id));
      questions = await QuizQuestion.find({ _id: { $in: questionIds } });
      // Preserve order of questionIds
      questions = questionIds.map((id) =>
        questions.find((q) => q._id.toString() === id.toString())
      );
    } else {
      // Get random questions from the category, excluding ones user has attempted
      let excludedQuestionIds: Types.ObjectId[] = [];

      if (userId) {
        // Get all questions the user has already attempted
        const userQuizzes = await QuizResult.find({ userId });
        excludedQuestionIds = userQuizzes.flatMap((quiz) =>
          quiz.answers.map((answer) => new Types.ObjectId(answer.questionId))
        );
      }

      const pipeline: PipelineStage[] = [{ $match: { category, subCategory } }];

      // Exclude already attempted questions if userId provided
      if (excludedQuestionIds.length > 0) {
        pipeline.push({
          $match: { _id: { $nin: excludedQuestionIds } },
        });
      }

      pipeline.push({ $sample: { size: Math.min(count, 100) } });

      // Don't send correct answer during quiz, but include for review
      if (!review) {
        pipeline.push({ $project: { correctAnswer: 0 } });
      }

      questions = await QuizQuestion.aggregate(pipeline);
    }

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
