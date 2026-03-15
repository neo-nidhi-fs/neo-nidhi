/**
 * Hook: useAdminUsers
 * Manages user-related state and operations
 * Single Responsibility: User management only
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminService, User } from '@/lib/services/adminService';

export function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState<
    string | null
  >(null);
  const [updateUserLoading, setUpdateUserLoading] = useState<string | null>(
    null
  );

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
    async (name: string, dob: string, password: string) => {
      try {
        setAddUserLoading(true);
        const newUser = await adminService.createUser(name, dob, password);
        setUsers((prev) => [...prev, newUser]);
        return { success: true, message: '✅ User registered successfully' };
      } catch (err) {
        return {
          success: false,
          message: `❌ Error: ${(err as Error).message}`,
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
          message: `✅ Password reset to default for ${userName}`,
        };
      } catch (err) {
        return {
          success: false,
          message: `❌ Error: ${(err as Error).message}`,
        };
      } finally {
        setResetPasswordLoading(null);
      }
    },
    []
  );

  const updateUserDob = useCallback(
    async (userId: string, dob: string | null) => {
      try {
        setUpdateUserLoading(userId);
        const updatedUser = await adminService.updateUser(userId, { dob });
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? updatedUser : u))
        );
        return { success: true, message: '✅ User updated successfully' };
      } catch (err) {
        return {
          success: false,
          message: `❌ Error: ${(err as Error).message}`,
        };
      } finally {
        setUpdateUserLoading(null);
      }
    },
    []
  );

  return {
    users,
    loading,
    addUserLoading,
    resetPasswordLoading,
    updateUserLoading,
    addUser,
    resetPassword,
    updateUserDob,
    refetchUsers: fetchUsers,
  };
}
