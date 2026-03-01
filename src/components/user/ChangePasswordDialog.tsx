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

interface ChangePasswordDialogProps {
  userId: string;
  onPasswordChanged?: () => void;
}

export function ChangePasswordDialog({
  userId,
  onPasswordChanged,
}: ChangePasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const oldPassword = formData.get('oldPassword')?.toString() || '';
    const newPassword = formData.get('newPassword')?.toString() || '';

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, oldPassword, newPassword }),
      });

      const data = await res.json();
      setMessage(res.ok ? '✅ Password updated successfully' : `❌ ${data.error}`);

      if (res.ok) {
        setTimeout(() => {
          setOpen(false);
          setMessage('');
          onPasswordChanged?.();
        }, 1500);
      }
    } finally {
      setLoading(false);
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
          {message && (
            <p className={`text-sm ${message.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
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
