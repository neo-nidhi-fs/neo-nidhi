import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { User } from '@/models/User';

type AdminLikeRole = 'admin' | 'privileged';

export interface AdminAccessContext {
  actorId: string;
  role: AdminLikeRole;
  isAdmin: boolean;
  managedUserIds: string[];
}

export async function requireAdminLikeAccess(): Promise<
  | { ok: true; context: AdminAccessContext }
  | { ok: false; response: NextResponse }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  const actor = await User.findById(session.user.id).select(
    'role managedUserIds'
  );
  if (!actor) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      ),
    };
  }

  if (actor.role !== 'admin' && actor.role !== 'privileged') {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    context: {
      actorId: actor._id.toString(),
      role: actor.role as AdminLikeRole,
      isAdmin: actor.role === 'admin',
      managedUserIds: (actor.managedUserIds || []).map((id) => id.toString()),
    },
  };
}

export function canManageUser(
  access: AdminAccessContext,
  targetUserId: string
): boolean {
  return access.isAdmin || access.managedUserIds.includes(targetUserId);
}

export function getManagedUsersFilter(access: AdminAccessContext) {
  if (access.isAdmin) {
    return {};
  }
  return { _id: { $in: access.managedUserIds } };
}
