import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { Scheme } from '@/models/Scheme';

// ✅ PUT: Update scheme
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const body = await req.json();
    const name = String(body.name || '').trim().toLowerCase();
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
      if (amount === null || Number.isNaN(amount) || amount <= 0) {
        return NextResponse.json(
          { success: false, error: 'RD amount must be greater than 0' },
          { status: 400 }
        );
      }
      if (
        tenureMonths === null ||
        Number.isNaN(tenureMonths) ||
        tenureMonths <= 0
      ) {
        return NextResponse.json(
          { success: false, error: 'RD tenure must be greater than 0 months' },
          { status: 400 }
        );
      }
    }

    const scheme = await Scheme.findByIdAndUpdate(
      id,
      {
        name,
        interestRate,
        amount: name === 'rd' ? amount : null,
        tenureMonths: name === 'rd' ? tenureMonths : null,
      },
      { new: true }
    );

    if (!scheme) {
      return NextResponse.json(
        { success: false, error: 'Scheme not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: scheme });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// ✅ DELETE: Delete scheme
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;

    const scheme = await Scheme.findByIdAndDelete(id);

    if (!scheme) {
      return NextResponse.json(
        { success: false, error: 'Scheme not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Scheme deleted successfully',
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
