/**
 * InterestRateDialog Component
 * Responsibility: Render interest rate modification dialog
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
import { Loader, Percent } from 'lucide-react';
import { FormEvent, useState, useEffect } from 'react';
import { User } from '@/lib/services/adminService';

interface InterestRateDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (rates: {
    saving?: number | null;
    fd?: number | null;
    loan?: number | null;
  }) => void;
  loading: boolean;
}

export function InterestRateDialog({
  user,
  open,
  onOpenChange,
  onSubmit,
  loading,
}: InterestRateDialogProps) {
  const [form, setForm] = useState({
    saving: '',
    fd: '',
    loan: '',
  });

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setForm({
          saving: user.customInterestRates?.saving?.toString() || '',
          fd: user.customInterestRates?.fd?.toString() || '',
          loan: user.customInterestRates?.loan?.toString() || '',
        });
      }, 0);
    }
  }, [open, user.customInterestRates]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const rates: Record<string, number | null | undefined> = {};

    if (form.saving !== '') {
      rates.saving = form.saving === 'null' ? null : Number(form.saving);
    }
    if (form.fd !== '') {
      rates.fd = form.fd === 'null' ? null : Number(form.fd);
    }
    if (form.loan !== '') {
      rates.loan = form.loan === 'null' ? null : Number(form.loan);
    }

    onSubmit(rates as Parameters<typeof onSubmit>[0]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          title="Edit custom interest rates"
        >
          <Percent size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
            Custom Interest Rates for {user.name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor={`saving-${user._id}`} className="text-gray-100">
              Savings Rate (%) - Leave empty to use default
            </Label>
            <Input
              id={`saving-${user._id}`}
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 5.5"
              value={form.saving}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, saving: e.target.value }))
              }
              disabled={loading}
              className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
            />
          </div>

          <div>
            <Label htmlFor={`fd-${user._id}`} className="text-gray-100">
              Fixed Deposit Rate (%) - Leave empty to use default
            </Label>
            <Input
              id={`fd-${user._id}`}
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 7.2"
              value={form.fd}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, fd: e.target.value }))
              }
              disabled={loading}
              className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
            />
          </div>

          <div>
            <Label htmlFor={`loan-${user._id}`} className="text-gray-100">
              Loan Rate (%) - Leave empty to use default
            </Label>
            <Input
              id={`loan-${user._id}`}
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 11.0"
              value={form.loan}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, loan: e.target.value }))
              }
              disabled={loading}
              className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
            />
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>💡 Leave fields empty to keep using default scheme rates.</p>
            <p>Leave fields empty to revert to defaults.</p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Updating...
              </>
            ) : (
              'Update Interest Rates'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
