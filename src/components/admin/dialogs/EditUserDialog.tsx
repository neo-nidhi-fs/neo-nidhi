/**
 * EditUserDialog Component
 * Responsibility: Allow admin to edit full user details except password
 */

'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from 'lucide-react';
import { User } from '@/lib/services/adminService';

type UserRole = 'admin' | 'privileged' | 'user';

interface EditUserDialogProps {
  user: User | null;
  users: User[];
  open: boolean;
  currentUserRole?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    userId: string,
    updates: {
      name: string;
      dob: string | null;
      role: UserRole;
      managedUserIds: string[];
      savingsBalance: number;
      fd: number;
      loanBalance: number;
      accruedSavingInterest: number;
      accruedFdInterest: number;
      accruedLoanInterest: number;
    }
  ) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
}

const formatDateForInput = (value?: string | Date | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const parseNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function EditUserDialog({
  user,
  users,
  open,
  currentUserRole = 'admin',
  onOpenChange,
  onSubmit,
  loading,
}: EditUserDialogProps) {
  const [name, setName] = useState(() => user?.name || '');
  const [dob, setDob] = useState(() => formatDateForInput(user?.dob));
  const [role, setRole] = useState<UserRole>(() => user?.role || 'user');
  const [managedUserIds, setManagedUserIds] = useState<string[]>(
    () => user?.managedUserIds || []
  );
  const [savingsBalance, setSavingsBalance] = useState(() =>
    String(user?.savingsBalance || 0)
  );
  const [fd, setFd] = useState(() => String(user?.fd || 0));
  const [loanBalance, setLoanBalance] = useState(() =>
    String(user?.loanBalance || 0)
  );
  const [accruedSavingInterest, setAccruedSavingInterest] = useState(() =>
    String(user?.accruedSavingInterest || 0)
  );
  const [accruedFdInterest, setAccruedFdInterest] = useState(() =>
    String(user?.accruedFdInterest || 0)
  );
  const [accruedLoanInterest, setAccruedLoanInterest] = useState(() =>
    String(user?.accruedLoanInterest || 0)
  );

  const normalUsers = useMemo(
    () => users.filter((u) => u.role === 'user'),
    [users]
  );

  const handleManagedUserToggle = (userId: string, checked: boolean) => {
    if (checked) {
      setManagedUserIds((prev) => [...new Set([...prev, userId])]);
      return;
    }
    setManagedUserIds((prev) => prev.filter((id) => id !== userId));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const result = await onSubmit(user._id, {
      name: name.trim(),
      dob: dob || null,
      role,
      managedUserIds: role === 'privileged' ? managedUserIds : [],
      savingsBalance: parseNumber(savingsBalance),
      fd: parseNumber(fd),
      loanBalance: parseNumber(loanBalance),
      accruedSavingInterest: parseNumber(accruedSavingInterest),
      accruedFdInterest: parseNumber(accruedFdInterest),
      accruedLoanInterest: parseNumber(accruedLoanInterest),
    });

    if (result.success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 w-[92vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
            Update User {user ? `- ${user.name}` : ''}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name" className="text-gray-100">
                Name
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
              />
            </div>
            <div>
              <Label htmlFor="edit-dob" className="text-gray-100">
                Date of Birth
              </Label>
              <Input
                id="edit-dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                disabled={loading}
                className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-role" className="text-gray-100">
              Role
            </Label>
            <select
              id="edit-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
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
              {role !== 'privileged' && (
                <p className="text-xs text-slate-400 px-1 py-2">
                  Select role as privileged to assign users.
                </p>
              )}
              {role === 'privileged' &&
                normalUsers.map((normalUser) => (
                  <label
                    key={normalUser._id}
                    className="flex items-center gap-2 text-sm text-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={managedUserIds.includes(normalUser._id)}
                      onChange={(e) =>
                        handleManagedUserToggle(normalUser._id, e.target.checked)
                      }
                      disabled={loading}
                    />
                    {normalUser.name}
                  </label>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit-savings" className="text-gray-100">
                Savings Balance
              </Label>
              <Input
                id="edit-savings"
                type="number"
                step="0.01"
                value={savingsBalance}
                onChange={(e) => setSavingsBalance(e.target.value)}
                disabled={loading}
                className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
              />
            </div>
            <div>
              <Label htmlFor="edit-fd" className="text-gray-100">
                FD Balance
              </Label>
              <Input
                id="edit-fd"
                type="number"
                step="0.01"
                value={fd}
                onChange={(e) => setFd(e.target.value)}
                disabled={loading}
                className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
              />
            </div>
            <div>
              <Label htmlFor="edit-loan" className="text-gray-100">
                Loan Balance
              </Label>
              <Input
                id="edit-loan"
                type="number"
                step="0.01"
                value={loanBalance}
                onChange={(e) => setLoanBalance(e.target.value)}
                disabled={loading}
                className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit-sb-interest" className="text-gray-100">
                SB Accrued Interest
              </Label>
              <Input
                id="edit-sb-interest"
                type="number"
                step="0.01"
                value={accruedSavingInterest}
                onChange={(e) => setAccruedSavingInterest(e.target.value)}
                disabled={loading}
                className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
              />
            </div>
            <div>
              <Label htmlFor="edit-fd-interest" className="text-gray-100">
                FD Accrued Interest
              </Label>
              <Input
                id="edit-fd-interest"
                type="number"
                step="0.01"
                value={accruedFdInterest}
                onChange={(e) => setAccruedFdInterest(e.target.value)}
                disabled={loading}
                className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
              />
            </div>
            <div>
              <Label htmlFor="edit-loan-interest" className="text-gray-100">
                Loan Accrued Interest
              </Label>
              <Input
                id="edit-loan-interest"
                type="number"
                step="0.01"
                value={accruedLoanInterest}
                onChange={(e) => setAccruedLoanInterest(e.target.value)}
                disabled={loading}
                className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !user}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Updating...
              </>
            ) : (
              'Update User'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
