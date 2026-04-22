import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { calculateAge } from '@/lib/helpers';
import { FEATURE_KEYS, FeatureKey } from '@/lib/userFeatures';
import { canManageUser, requireAdminLikeAccess } from '@/lib/adminAccess';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const isSelf = session.user.id === id;

    const accessResult = await requireAdminLikeAccess();
    const hasManagedAccess =
      accessResult.ok && canManageUser(accessResult.context, id);

    if (hasManagedAccess || isSelf) {
      const user = await User.findById(id).select('-password -mpin');
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: user });
    }

    // Authenticated users can fetch only minimal public user identity for transfers.
    const publicUser = await User.findById(id).select('_id name');
    if (!publicUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: publicUser });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const isSelf = session.user.id === id;

    const accessResult = await requireAdminLikeAccess();
    const hasManagedAccess =
      accessResult.ok && canManageUser(accessResult.context, id);

    if (!isSelf && !hasManagedAccess) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await req.json();

    const setData: Record<string, unknown> = {};
    const unsetData: Record<string, unknown> = {};

    if (body.dob !== undefined) {
      const dob = body.dob ? new Date(body.dob) : null;
      setData.dob = dob;
      const calculatedAge = calculateAge(dob);
      if (calculatedAge !== null) {
        setData.age = calculatedAge;
      }
    }

    if (body.age !== undefined) {
      setData.age = body.age;
    }

    if (
      body.features &&
      typeof body.features === 'object' &&
      !Array.isArray(body.features)
    ) {
      for (const key of FEATURE_KEYS) {
        const value = (body.features as Partial<Record<FeatureKey, unknown>>)[
          key
        ];
        if (value !== undefined) {
          setData[`features.${key}`] = Boolean(value);
        }
      }
      unsetData.financeFeaturesEnabled = 1;
    }

    if (body.financeFeaturesEnabled !== undefined) {
      setData['features.financeFeaturesEnabled'] = Boolean(
        body.financeFeaturesEnabled
      );
      unsetData.financeFeaturesEnabled = 1;
    }

    const isFullAdmin = accessResult.ok && accessResult.context.isAdmin;

    if (body.role !== undefined) {
      if (!isFullAdmin) {
        return NextResponse.json(
          { success: false, error: 'Only admins can change roles' },
          { status: 403 }
        );
      }
      const allowedRoles = ['admin', 'privileged', 'user'];
      if (!allowedRoles.includes(body.role)) {
        return NextResponse.json(
          { success: false, error: 'Invalid role' },
          { status: 400 }
        );
      }
      setData.role = body.role;
    }

    if (body.managedUserIds !== undefined) {
      if (!isFullAdmin) {
        return NextResponse.json(
          { success: false, error: 'Only admins can update managed users' },
          { status: 403 }
        );
      }

      if (!Array.isArray(body.managedUserIds)) {
        return NextResponse.json(
          { success: false, error: 'managedUserIds must be an array' },
          { status: 400 }
        );
      }

      const targetUser = await User.findById(id).select('role');
      if (!targetUser) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      if (targetUser.role !== 'privileged') {
        return NextResponse.json(
          {
            success: false,
            error: 'Managed users can only be set for privileged users',
          },
          { status: 400 }
        );
      }

      const managedUserIds = body.managedUserIds.filter(
        (item: unknown) => typeof item === 'string'
      );

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
            error: 'Managed users must be normal users only',
          },
          { status: 400 }
        );
      }

      setData.managedUserIds = managedUserIds;
    }

    const updateQuery: Record<string, unknown> = {};
    if (Object.keys(setData).length > 0) {
      updateQuery.$set = setData;
    }
    if (Object.keys(unsetData).length > 0) {
      updateQuery.$unset = unsetData;
    }

    const updatedUser =
      Object.keys(updateQuery).length === 0
        ? await User.findById(id).select('-password -mpin')
        : await User.findByIdAndUpdate(id, updateQuery, {
            new: true,
            projection: '-password -mpin',
          });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
