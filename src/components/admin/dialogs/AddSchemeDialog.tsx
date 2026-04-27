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
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Scheme } from '@/lib/services/adminService';

interface AddSchemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    name: string,
    interestRate: number,
    amount?: number | null,
    tenureMonths?: number | null
  ) => void;
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
  const [selectedName, setSelectedName] = useState('deposit');

  useEffect(() => {
    if (editingScheme?.name) {
      setSelectedName(editingScheme.name);
      return;
    }
    if (!open) {
      setSelectedName('deposit');
    }
  }, [editingScheme?.name, open]);

  const isRd = useMemo(() => selectedName === 'rd', [selectedName]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name')?.toString() || '';
    const interestRate = Number(formData.get('interestRate'));
    const amountRaw = formData.get('amount')?.toString() || '';
    const tenureRaw = formData.get('tenureMonths')?.toString() || '';
    const amount = amountRaw === '' ? null : Number(amountRaw);
    const tenureMonths = tenureRaw === '' ? null : Number(tenureRaw);
    onSubmit(name, interestRate, amount, tenureMonths);
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
            <select
              id="name"
              name="name"
              defaultValue={editingScheme?.name || 'deposit'}
              onChange={(e) => setSelectedName(e.target.value)}
              required
              disabled={loading}
              className="w-full mt-1 rounded-md bg-slate-700 border border-slate-600 px-3 py-2 text-white disabled:opacity-50"
            >
              <option value="deposit">deposit</option>
              <option value="fd">fd</option>
              <option value="loan">loan</option>
              <option value="rd">rd</option>
            </select>
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
          {isRd && (
            <>
              <div>
                <Label htmlFor="amount" className="text-gray-100">
                  RD Amount
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  defaultValue={editingScheme?.amount ?? ''}
                  required
                  disabled={loading}
                  className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                />
              </div>
              <div>
                <Label htmlFor="tenureMonths" className="text-gray-100">
                  RD Tenure (Months)
                </Label>
                <Input
                  id="tenureMonths"
                  name="tenureMonths"
                  type="number"
                  step="1"
                  min="1"
                  defaultValue={editingScheme?.tenureMonths ?? ''}
                  required
                  disabled={loading}
                  className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                />
              </div>
            </>
          )}
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
