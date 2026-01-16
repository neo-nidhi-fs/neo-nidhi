import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Scheme } from '@/models/Scheme';

// ✅ GET: Fetch all schemes
export async function GET() {
  try {
    await dbConnect();
    const schemes = await Scheme.find({});
    return NextResponse.json({ success: true, data: schemes });
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

    const scheme = new Scheme({
      name: body.name,
      interestRate: body.interestRate,
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
