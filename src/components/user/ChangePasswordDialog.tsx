'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from 'lucide-react';
import { useAuthPassword } from '@/hooks/useServices';

interface ChangePasswordDialogProps {
  userId: string;
  onPasswordChanged?: () => void;
}

export function ChangePasswordDialog({
  userId,
  onPasswordChanged,
}: ChangePasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const { changePassword, loading, error, success } = useAuthPassword(userId);

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const oldPassword = formData.get('oldPassword')?.toString() || '';
    const newPassword = formData.get('newPassword')?.toString() || '';

    const result = await changePassword(oldPassword, newPassword);

    if (result) {
      e.currentTarget.reset();
      setTimeout(() => {
        setOpen(false);
        onPasswordChanged?.();
      }, 1500);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-6">
          🔑 Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 w-[90vw] sm:w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Update Your Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <Label htmlFor="oldPassword" className="text-gray-100">
              Old Password
            </Label>
            <Input
              id="oldPassword"
              name="oldPassword"
              type="password"
              required
              disabled={loading}
              className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
            />
          </div>
          <div>
            <Label htmlFor="newPassword" className="text-gray-100">
              New Password
            </Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              disabled={loading}
              className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
            />
          </div>
          {error && <p className="text-sm text-red-400">❌ {error}</p>}
          {success && <p className="text-sm text-green-400">✅ {success}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin mr-2" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
