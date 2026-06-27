import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Scheme } from '@/models/Scheme';

// ✅ GET: Fetch all schemes
export async function GET() {
  try {
    await dbConnect();
    const schemes = await Scheme.find({}).lean();
    return NextResponse.json(
      { success: true, data: schemes },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ✅ POST: Add new scheme
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const name = String(body.name || '')
      .trim()
      .toLowerCase();
    const interestRate = Number(body.interestRate);
    const amount =
      body.amount === null || body.amount === undefined || body.amount === ''
        ? null
        : Number(body.amount);
    const tenureMonths =
      body.tenureMonths === null ||
      body.tenureMonths === undefined ||
      body.tenureMonths === ''
        ? null
        : Number(body.tenureMonths);

    if (!name || Number.isNaN(interestRate)) {
      return NextResponse.json(
        { success: false, error: 'Invalid scheme payload' },
        { status: 400 }
      );
    }

    if (name === 'rd') {
      if (amount !== null && (Number.isNaN(amount) || amount <= 0)) {
        return NextResponse.json(
          { success: false, error: 'RD amount must be greater than 0' },
          { status: 400 }
        );
      }
      if (
        tenureMonths !== null &&
        (Number.isNaN(tenureMonths) || tenureMonths <= 0)
      ) {
        return NextResponse.json(
          { success: false, error: 'RD tenure must be greater than 0 months' },
          { status: 400 }
        );
      }
    }

    const scheme = new Scheme({
      name,
      interestRate,
      amount: name === 'rd' ? amount : null,
      tenureMonths: name === 'rd' ? tenureMonths : null,
    });

    await scheme.save();

    return NextResponse.json({ success: true, data: scheme }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
