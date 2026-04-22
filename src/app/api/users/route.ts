import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { calculateAge } from '@/lib/helpers';
import { getManagedUsersFilter, requireAdminLikeAccess } from '@/lib/adminAccess';

export async function GET() {
  try {
    await dbConnect();
    const accessResult = await requireAdminLikeAccess();
    if (!accessResult.ok) {
      return accessResult.response;
    }

    const users = await User.find(getManagedUsersFilter(accessResult.context))
      .select('-password -mpin');
    return NextResponse.json({ success: true, data: users });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const accessResult = await requireAdminLikeAccess();
    if (!accessResult.ok) {
      return accessResult.response;
    }

    const body = await req.json();
    const requestedRole =
      typeof body.role === 'string' ? body.role.trim().toLowerCase() : 'user';
    const allowedRoles = ['admin', 'privileged', 'user'];

    if (!allowedRoles.includes(requestedRole)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    if (
      (requestedRole === 'admin' || requestedRole === 'privileged') &&
      !accessResult.context.isAdmin
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only admins can create admin/privileged users',
        },
        { status: 403 }
      );
    }

    const dob = body.dob ? new Date(body.dob) : null;
    const age = dob ? calculateAge(dob) : body.age || 0;

    const requestedManagedUserIds: string[] = Array.isArray(body.managedUserIds)
      ? body.managedUserIds.filter((id: unknown) => typeof id === 'string')
      : [];

    const managedUserIds =
      requestedRole === 'privileged' && accessResult.context.isAdmin
        ? requestedManagedUserIds
        : [];

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

    // Create new user (password will be hashed automatically by pre-save hook in User model)
    const newUser = new User({
      name: body.name?.trim(),
      age: age,
      dob: dob,
      role: requestedRole, // default to user
      managedUserIds,
      savingsBalance: body.savingsBalance || 0,
      loanBalance: 0,
      password: body.password, // raw password, will be hashed
    });

    await newUser.save();

    // If a privileged operator creates a normal user, auto-assign access to that user.
    if (!accessResult.context.isAdmin && requestedRole === 'user') {
      const actor = await User.findById(accessResult.context.actorId);
      if (actor) {
        const existing = (actor.managedUserIds || []).map((id) => id.toString());
        if (!existing.includes(newUser._id.toString())) {
          actor.managedUserIds = [...(actor.managedUserIds || []), newUser._id];
          await actor.save();
        }
      }
    }

    const createdUser = await User.findById(newUser._id).select('-password -mpin');
    return NextResponse.json(
      { success: true, data: createdUser },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
