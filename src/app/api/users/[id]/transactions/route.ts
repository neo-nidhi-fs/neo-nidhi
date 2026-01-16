import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Transaction } from '@/models/Transaction';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;

    const transactions = await Transaction.find({ userId: id }).sort({
      date: -1,
    });
    return NextResponse.json({ success: true, data: transactions });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
