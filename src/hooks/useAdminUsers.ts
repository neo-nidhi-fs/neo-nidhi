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

  return {
    users,
    loading,
    addUserLoading,
    resetPasswordLoading,
    addUser,
    resetPassword,
    refetchUsers: fetchUsers,
  };
}
