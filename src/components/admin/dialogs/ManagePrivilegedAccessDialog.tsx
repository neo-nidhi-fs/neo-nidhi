'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader } from 'lucide-react';
import { User } from '@/lib/services/adminService';
import { FormEvent } from 'react';

interface ManagePrivilegedAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  privilegedUser: User | null;
  users: User[];
  loading: boolean;
  onSubmit: (
    privilegedUserId: string,
    managedUserIds: string[]
  ) => Promise<{ success: boolean; message: string }>;
}

export function ManagePrivilegedAccessDialog({
  open,
  onOpenChange,
  privilegedUser,
  users,
  loading,
  onSubmit,
}: ManagePrivilegedAccessDialogProps) {
  const normalUsers = users.filter((user) => user.role === 'user');

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!privilegedUser) return;
    const formData = new FormData(e.currentTarget);
    const selectedManagedIds = formData.getAll('managedUserIds') as string[];
    const result = await onSubmit(privilegedUser._id, selectedManagedIds);
    if (result.success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 w-[90vw] sm:w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
            Manage Access: {privilegedUser?.name || 'Privileged user'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-3">
          <p className="text-sm text-slate-300">
            Select users this privileged user can manage.
          </p>
          <div className="max-h-64 overflow-y-auto rounded-md border border-slate-600 bg-slate-900/40 p-3 space-y-2">
            {normalUsers.map((user) => (
              <label
                key={user._id}
                className="flex items-center gap-2 text-sm text-gray-200"
              >
                <input
                  type="checkbox"
                  name="managedUserIds"
                  value={user._id}
                  defaultChecked={
                    privilegedUser?.managedUserIds?.includes(user._id) || false
                  }
                  disabled={loading}
                />
                {user.name}
              </label>
            ))}
          </div>
          <Button
            type="submit"
            disabled={loading || !privilegedUser}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save Access'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
