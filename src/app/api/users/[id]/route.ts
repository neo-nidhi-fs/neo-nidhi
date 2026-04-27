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

    const isFullAdmin = accessResult.ok && accessResult.context.isAdmin;

    const requireFullAdminForField = (fieldName: string) => {
      if (!isFullAdmin) {
        return NextResponse.json(
          { success: false, error: `Only admins can update ${fieldName}` },
          { status: 403 }
        );
      }
      return null;
    };

    if (body.name !== undefined) {
      const forbiddenResponse = requireFullAdminForField('name');
      if (forbiddenResponse) return forbiddenResponse;

      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid name' },
          { status: 400 }
        );
      }
      setData.name = body.name.trim();
    }

    if (body.age !== undefined) {
      setData.age = body.age;
    }

    const numericFields: Array<{
      key:
        | 'savingsBalance'
        | 'fd'
        | 'rd'
        | 'loanBalance'
        | 'accruedSavingInterest'
        | 'accruedFdInterest'
        | 'accruedRdInterest'
        | 'accruedLoanInterest';
      label: string;
    }> = [
      { key: 'savingsBalance', label: 'savings balance' },
      { key: 'fd', label: 'FD balance' },
      { key: 'rd', label: 'RD balance' },
      { key: 'loanBalance', label: 'loan balance' },
      { key: 'accruedSavingInterest', label: 'accrued saving interest' },
      { key: 'accruedFdInterest', label: 'accrued FD interest' },
      { key: 'accruedRdInterest', label: 'accrued RD interest' },
      { key: 'accruedLoanInterest', label: 'accrued loan interest' },
    ];

    for (const field of numericFields) {
      if (body[field.key] === undefined) continue;

      const forbiddenResponse = requireFullAdminForField(field.label);
      if (forbiddenResponse) return forbiddenResponse;

      if (typeof body[field.key] !== 'number' || Number.isNaN(body[field.key])) {
        return NextResponse.json(
          { success: false, error: `Invalid ${field.label}` },
          { status: 400 }
        );
      }

      setData[field.key] = body[field.key];
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

      const nextRole =
        typeof body.role === 'string' ? body.role : targetUser.role;

      const managedUserIds = body.managedUserIds.filter(
        (item: unknown) => typeof item === 'string'
      );

      if (nextRole !== 'privileged') {
        if (managedUserIds.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: 'Managed users can only be set for privileged users',
            },
            { status: 400 }
          );
        }
        // Keep non-privileged users with no managed users.
        setData.managedUserIds = [];
      } else {
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
    } else if (body.role !== undefined && body.role !== 'privileged') {
      // If role is changed away from privileged and managedUserIds is omitted,
      // clear stale managed users automatically.
      if (!isFullAdmin) {
        return NextResponse.json(
          { success: false, error: 'Only admins can update managed users' },
          { status: 403 }
        );
      }
      setData.managedUserIds = [];
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
