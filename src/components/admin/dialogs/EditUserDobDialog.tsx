/**
 * EditUserDobDialog Component
 * Responsibility: Allow admin to edit a user's date of birth
 */

'use client';

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
import { FormEvent } from 'react';
import { User } from '@/lib/services/adminService';

interface EditUserDobDialogProps {
  user: User | null;
  open: boolean;
  dob: string;
  onDobChange: (dob: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: (userId: string, dob: string | null) => void;
  loading: boolean;
}

export function EditUserDobDialog({
  user,
  open,
  dob,
  onDobChange,
  onOpenChange,
  onSubmit,
  loading,
}: EditUserDobDialogProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    onSubmit(user._id, dob || null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
            Edit Date of Birth {user ? `for ${user.name}` : ''}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="dob" className="text-gray-100">
              Date of Birth
            </Label>
            <Input
              id="dob"
              name="dob"
              type="date"
              value={dob}
              onChange={(e) => onDobChange(e.target.value)}
              disabled={loading}
              className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !user}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
