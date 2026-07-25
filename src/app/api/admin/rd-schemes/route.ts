import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { RDScheme } from '@/models/RDScheme';
import { requireAdminLikeAccess } from '@/lib/adminAccess';

export async function GET() {
  try {
    const accessResult = await requireAdminLikeAccess();
    if (!accessResult.ok) return accessResult.response;

    await dbConnect();
    const schemes = await RDScheme.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: schemes });
  } catch (err) {
    console.error('GET /api/admin/rd-schemes error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const accessResult = await requireAdminLikeAccess();
    if (!accessResult.ok) return accessResult.response;

    await dbConnect();
    const body = await req.json();

    const name = String(body.name || '').trim();
    const interestRate = Number(body.interestRate);
    const tenureMonths = Number(body.tenureMonths);
    const minMonthlyAmount = Number(body.minMonthlyAmount);
    const maxMonthlyAmount =
      body.maxMonthlyAmount != null ? Number(body.maxMonthlyAmount) : null;
    const description = String(body.description || '').trim();
    const isActive = body.isActive !== false;
    const allowAutoDebit = body.allowAutoDebit !== false;
    const allowOneTimeInvestment = body.allowOneTimeInvestment === true;

    if (
      !name ||
      Number.isNaN(interestRate) ||
      interestRate < 0 ||
      !Number.isInteger(tenureMonths) ||
      tenureMonths < 1 ||
      Number.isNaN(minMonthlyAmount) ||
      minMonthlyAmount < 1
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid scheme parameters' },
        { status: 400 }
      );
    }

    if (maxMonthlyAmount !== null && maxMonthlyAmount < minMonthlyAmount) {
      return NextResponse.json(
        {
          success: false,
          error: 'maxMonthlyAmount must be >= minMonthlyAmount',
        },
        { status: 400 }
      );
    }

    const scheme = await RDScheme.create({
      name,
      description,
      interestRate,
      tenureMonths,
      minMonthlyAmount,
      maxMonthlyAmount,
      isActive,
      allowAutoDebit,
      allowOneTimeInvestment,
    });

    return NextResponse.json(
      { success: true, data: scheme, message: 'RD scheme created' },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A scheme with this name already exists' },
        { status: 409 }
      );
    }
    console.error('POST /api/admin/rd-schemes error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
