/**
 * Hook: useAdminUsers
 * Manages user-related state and operations
 * Single Responsibility: User management only
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminService, User } from '@/lib/services/adminService';
import { FeatureKey } from '@/lib/userFeatures';

export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState<
    string | null
  >(null);
  const [resetMPINLoading, setResetMPINLoading] = useState<string | null>(null);
  const [updateUserLoading, setUpdateUserLoading] = useState<string | null>(
    null
  );
  const [updateFeatureToggleLoading, setUpdateFeatureToggleLoading] = useState<
    string | null
  >(null);
  const [updateManagedUsersLoading, setUpdateManagedUsersLoading] = useState<
    string | null
  >(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = useCallback(
    async (
      name: string,
      dob: string,
      password: string,
      role: 'admin' | 'privileged' | 'user' = 'user',
      managedUserIds: string[] = []
    ) => {
      try {
        setAddUserLoading(true);
        const newUser = await adminService.createUser(
          name,
          dob,
          password,
          role,
          managedUserIds
        );
        setUsers((prev) => [...prev, newUser]);
        return { success: true, message: 'User registered successfully' };
      } catch (err) {
        return {
          success: false,
          message: `Error: ${(err as Error).message}`,
        };
      } finally {
        setAddUserLoading(false);
      }
    },
    []
  );

  const resetPassword = useCallback(
    async (userId: string, userName: string) => {
      try {
        setResetPasswordLoading(userId);
        await adminService.resetPassword(userId);
        return {
          success: true,
          message: `Password reset to default for ${userName}`,
        };
      } catch (err) {
        return {
          success: false,
          message: `Error: ${(err as Error).message}`,
        };
      } finally {
        setResetPasswordLoading(null);
      }
    },
    []
  );

  const resetMPIN = useCallback(async (userId: string, userName: string) => {
    try {
      setResetMPINLoading(userId);
      await adminService.resetMPIN(userId);
      return {
        success: true,
        message: `MPIN reset to default for ${userName}`,
      };
    } catch (err) {
      return {
        success: false,
        message: `Error: ${(err as Error).message}`,
      };
    } finally {
      setResetMPINLoading(null);
    }
  }, []);

  const updateUserDob = useCallback(
    async (userId: string, dob: string | null) => {
      try {
        setUpdateUserLoading(userId);
        const updatedUser = await adminService.updateUser(userId, { dob });
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? updatedUser : u))
        );
        return { success: true, message: 'User updated successfully' };
      } catch (err) {
        return {
          success: false,
          message: `Error: ${(err as Error).message}`,
        };
      } finally {
        setUpdateUserLoading(null);
      }
    },
    []
  );

  const updateUserFeatureToggle = useCallback(
    async (userId: string, featureKey: FeatureKey, enabled: boolean) => {
      try {
        setUpdateFeatureToggleLoading(userId);
        const updatedUser = await adminService.updateUser(userId, {
          features: {
            [featureKey]: enabled,
          },
        });
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? updatedUser : u))
        );
        return { success: true, message: 'User feature toggle updated' };
      } catch (err) {
        return {
          success: false,
          message: `Error: ${(err as Error).message}`,
        };
      } finally {
        setUpdateFeatureToggleLoading(null);
      }
    },
    []
  );

  const updateManagedUsers = useCallback(
    async (privilegedUserId: string, managedUserIds: string[]) => {
      try {
        setUpdateManagedUsersLoading(privilegedUserId);
        const updatedManagedUsers = await adminService.updateManagedUsers(
          privilegedUserId,
          managedUserIds
        );
        setUsers((prev) =>
          prev.map((user) =>
            user._id === privilegedUserId
              ? { ...user, managedUserIds: updatedManagedUsers }
              : user
          )
        );
        return { success: true, message: 'Managed users updated' };
      } catch (err) {
        return {
          success: false,
          message: `Error: ${(err as Error).message}`,
        };
      } finally {
        setUpdateManagedUsersLoading(null);
      }
    },
    []
  );

  return {
    users,
    loading,
    addUserLoading,
    resetPasswordLoading,
    resetMPINLoading,
    updateUserLoading,
    updateFeatureToggleLoading,
    updateManagedUsersLoading,
    addUser,
    resetPassword,
    resetMPIN,
    updateUserDob,
    updateUserFeatureToggle,
    updateManagedUsers,
    refetchUsers: fetchUsers,
  };
}
