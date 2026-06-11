import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Settings } from '@/models/Settings';

// GET: Fetch current interest rates
export async function GET() {
  try {
    await dbConnect();
    const settings = await Settings.findOne({}).lean();
    return NextResponse.json(
      { success: true, data: settings },
      {
        headers: {
          'Cache-Control': 'public, max-age=120, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// POST: Update interest rates
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const settings = await Settings.findOneAndUpdate(
      {},
      {
        $set: {
          savingsInterestRate: body.savingsInterestRate,
          loanInterestRate: body.loanInterestRate,
        },
      },
      {
        upsert: true,
        new: true,
        sort: { _id: 1 },
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json(
      { success: true, data: settings },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
