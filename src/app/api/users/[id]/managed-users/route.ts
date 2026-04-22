import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { requireAdminLikeAccess } from '@/lib/adminAccess';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const accessResult = await requireAdminLikeAccess();
    if (!accessResult.ok) {
      return accessResult.response;
    }
    if (!accessResult.context.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only admins can view managed users' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const target = await User.findById(id).select('role managedUserIds');
    if (!target) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    if (target.role !== 'privileged') {
      return NextResponse.json(
        {
          success: false,
          error: 'Managed users are only available for privileged users',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: (target.managedUserIds || []).map((userId) => userId.toString()),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const accessResult = await requireAdminLikeAccess();
    if (!accessResult.ok) {
      return accessResult.response;
    }
    if (!accessResult.context.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only admins can update managed users' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();
    const managedUserIds: string[] = Array.isArray(body?.managedUserIds)
      ? body.managedUserIds.filter((entry: unknown) => typeof entry === 'string')
      : [];

    const target = await User.findById(id);
    if (!target) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    if (target.role !== 'privileged') {
      return NextResponse.json(
        {
          success: false,
          error: 'Managed users can only be set for privileged users',
        },
        { status: 400 }
      );
    }

    if (managedUserIds.length > 0) {
      const managedUsers = await User.find({
        _id: { $in: managedUserIds },
      }).select('_id role');

      if (managedUsers.length !== managedUserIds.length) {
        return NextResponse.json(
          { success: false, error: 'One or more managed users do not exist' },
          { status: 400 }
        );
      }

      const hasAdminLikeTarget = managedUsers.some(
        (user) => user.role === 'admin' || user.role === 'privileged'
      );
      if (hasAdminLikeTarget) {
        return NextResponse.json(
          {
            success: false,
            error: 'Privileged users can only be assigned normal users',
          },
          { status: 400 }
        );
      }
    }

    target.set('managedUserIds', managedUserIds);
    await target.save();

    return NextResponse.json({
      success: true,
      data: managedUserIds,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
