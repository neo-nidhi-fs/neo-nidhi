/**
 * AddSchemeDialog Component
 * Responsibility: Render scheme creation and edit dialog
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
import { Scheme } from '@/lib/services/adminService';

interface AddSchemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, interestRate: number) => void;
  loading: boolean;
  editingScheme: Scheme | null;
  onEditingSchemeChange: (scheme: Scheme | null) => void;
}

export function AddSchemeDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
  editingScheme,
  onEditingSchemeChange,
}: AddSchemeDialogProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name')?.toString() || '';
    const interestRate = Number(formData.get('interestRate'));
    onSubmit(name, interestRate);
    if (!editingScheme) e.currentTarget.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) onEditingSchemeChange(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold flex items-center gap-2">
          <Plus size={18} />
          Add New Scheme
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
            {editingScheme ? 'Edit Scheme' : 'Create New Scheme'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-100">
              Scheme Name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Normal Deposit / FD / RD"
              defaultValue={editingScheme?.name || ''}
              required
              disabled={loading}
              className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
            />
          </div>
          <div>
            <Label htmlFor="interestRate" className="text-gray-100">
              Interest Rate (%)
            </Label>
            <Input
              id="interestRate"
              name="interestRate"
              type="number"
              step="0.1"
              defaultValue={editingScheme?.interestRate || ''}
              required
              disabled={loading}
              className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                {editingScheme ? 'Updating...' : 'Adding...'}
              </>
            ) : editingScheme ? (
              'Update Scheme'
            ) : (
              'Add Scheme'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
