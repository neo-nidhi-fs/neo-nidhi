/**
 * AddUserDialog Component
 * Responsibility: Render user creation dialog
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { User } from '@/lib/services/adminService';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  currentUserRole?: string;
  onSubmit: (
    name: string,
    dob: string,
    password: string,
    role: 'admin' | 'privileged' | 'user',
    managedUserIds: string[]
  ) => void;
  loading: boolean;
}

export function AddUserDialog({
  open,
  onOpenChange,
  users,
  currentUserRole = 'admin',
  onSubmit,
  loading,
}: AddUserDialogProps) {
  const [selectedRole, setSelectedRole] = useState<
    'admin' | 'privileged' | 'user'
  >('user');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const dob = formData.get('dob') as string;
    const password = formData.get('password') as string;
    const role = (formData.get('role') as 'admin' | 'privileged' | 'user') || 'user';
    const managedUserIds = formData.getAll('managedUserIds') as string[];
    onSubmit(name, dob, password, role, managedUserIds);
    e.currentTarget.reset();
    setSelectedRole('user');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold flex items-center gap-2">
          <Plus size={18} />
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Register New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-100">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              required
              disabled={loading}
              className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
            />
          </div>
          <div>
            <Label htmlFor="dob" className="text-gray-100">
              Date of Birth
            </Label>
            <Input
              id="dob"
              name="dob"
              type="date"
              required
              disabled={loading}
              className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-gray-100">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={loading}
              className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
            />
          </div>
          <div>
            <Label htmlFor="role" className="text-gray-100">
              Role
            </Label>
            <select
              id="role"
              name="role"
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(
                  e.target.value as 'admin' | 'privileged' | 'user'
                )
              }
              disabled={loading}
              className="w-full mt-1 rounded-md bg-slate-700 border border-slate-600 px-3 py-2 text-white disabled:opacity-50"
            >
              <option value="user">User</option>
              <option value="privileged">Privileged user</option>
              {currentUserRole === 'admin' && <option value="admin">Admin</option>}
            </select>
          </div>
          <div>
            <Label className="text-gray-100">Managed Users (for privileged)</Label>
            <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-slate-600 bg-slate-900/40 p-2 space-y-1">
              {selectedRole !== 'privileged' && (
                <p className="text-xs text-slate-400 px-1 py-2">
                  Select role as privileged to assign users.
                </p>
              )}
              {selectedRole === 'privileged' &&
                users
                  .filter((user) => user.role === 'user')
                  .map((user) => (
                    <label
                      key={user._id}
                      className="flex items-center gap-2 text-sm text-gray-200"
                    >
                      <input
                        type="checkbox"
                        name="managedUserIds"
                        value={user._id}
                        disabled={loading}
                      />
                      {user.name}
                    </label>
                  ))}
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Registering...
              </>
            ) : (
              'Register'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
