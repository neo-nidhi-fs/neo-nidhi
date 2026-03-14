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
import { FormEvent } from 'react';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, dob: string, password: string) => void;
  loading: boolean;
}

export function AddUserDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: AddUserDialogProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const dob = formData.get('dob') as string;
    const password = formData.get('password') as string;
    onSubmit(name, dob, password);
    e.currentTarget.reset();
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
