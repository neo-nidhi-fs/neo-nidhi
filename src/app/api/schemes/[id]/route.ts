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

    const scheme = await Scheme.findByIdAndUpdate(
      id,
      {
        name: body.name,
        interestRate: body.interestRate,
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
