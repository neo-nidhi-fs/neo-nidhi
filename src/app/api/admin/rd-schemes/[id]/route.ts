import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { RDScheme } from '@/models/RDScheme';
import { RDSubscription } from '@/models/RDSubscription';
import { requireAdminLikeAccess } from '@/lib/adminAccess';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessResult = await requireAdminLikeAccess();
    if (!accessResult.ok) return accessResult.response;

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.description !== undefined)
      updates.description = String(body.description).trim();
    if (body.interestRate !== undefined) {
      const r = Number(body.interestRate);
      if (Number.isNaN(r) || r < 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid interestRate' },
          { status: 400 }
        );
      }
      updates.interestRate = r;
    }
    if (body.tenureMonths !== undefined) {
      const t = Number(body.tenureMonths);
      if (!Number.isInteger(t) || t < 1) {
        return NextResponse.json(
          { success: false, error: 'Invalid tenureMonths' },
          { status: 400 }
        );
      }
      updates.tenureMonths = t;
    }
    if (body.minMonthlyAmount !== undefined) {
      const m = Number(body.minMonthlyAmount);
      if (Number.isNaN(m) || m < 1) {
        return NextResponse.json(
          { success: false, error: 'Invalid minMonthlyAmount' },
          { status: 400 }
        );
      }
      updates.minMonthlyAmount = m;
    }
    if (body.maxMonthlyAmount !== undefined) {
      updates.maxMonthlyAmount =
        body.maxMonthlyAmount != null ? Number(body.maxMonthlyAmount) : null;
    }
    if (body.isActive !== undefined) updates.isActive = Boolean(body.isActive);
    if (body.allowAutoDebit !== undefined)
      updates.allowAutoDebit = Boolean(body.allowAutoDebit);
    if (body.allowOneTimeInvestment !== undefined)
      updates.allowOneTimeInvestment = Boolean(body.allowOneTimeInvestment);

    const scheme = await RDScheme.findByIdAndUpdate(id, updates, { new: true });
    if (!scheme) {
      return NextResponse.json(
        { success: false, error: 'Scheme not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: scheme,
      message: 'Scheme updated',
    });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A scheme with this name already exists' },
        { status: 409 }
      );
    }
    console.error('PUT /api/admin/rd-schemes/[id] error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessResult = await requireAdminLikeAccess();
    if (!accessResult.ok) return accessResult.response;

    await dbConnect();
    const { id } = await params;

    const activeCount = await RDSubscription.countDocuments({
      schemeId: id,
      status: { $in: ['active', 'missed'] },
    });
    if (activeCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete: ${activeCount} active subscription(s) reference this scheme`,
        },
        { status: 409 }
      );
    }

    const scheme = await RDScheme.findByIdAndDelete(id);
    if (!scheme) {
      return NextResponse.json(
        { success: false, error: 'Scheme not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Scheme deleted' });
  } catch (err) {
    console.error('DELETE /api/admin/rd-schemes/[id] error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
