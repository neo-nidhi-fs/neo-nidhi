/**
 * FdWithdrawDialog Component
 * Responsibility: Render FD withdrawal dialog
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
import { Label } from '@/components/ui/label';
import { Loader, Banknote } from 'lucide-react';
import { FormEvent } from 'react';
import { User, FdWithdrawInfo } from '@/lib/services/adminService';

interface FdWithdrawDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fdWithdrawInfo: FdWithdrawInfo;
  onFetchFdInfo: (userId: string) => void;
  onSubmit: (amount: number) => void;
  loading: boolean;
}

export function FdWithdrawDialog({
  user,
  open,
  onOpenChange,
  fdWithdrawInfo,
  onFetchFdInfo,
  onSubmit,
  loading,
}: FdWithdrawDialogProps) {
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (newOpen) {
      onFetchFdInfo(user._id);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('withdrawAmount'));
    onSubmit(amount);
    e.currentTarget.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {user.fd && user.fd > 0 && (
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
          >
            <Banknote size={16} />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
            Withdraw FD for {user.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mb-4">
          <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3">
            <p className="text-sm text-gray-300">Mature Amount (3+ years):</p>
            <p className="text-2xl font-bold text-green-400">
              ₹{fdWithdrawInfo.matureAmount.toFixed(2)}
            </p>
            {fdWithdrawInfo.matureTransactions.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                {fdWithdrawInfo.matureTransactions.length} transaction(s) ready
                to withdraw
              </p>
            )}
          </div>

          <div className="bg-orange-900/30 border border-orange-500/30 rounded-lg p-3">
            <p className="text-sm text-gray-300">
              Premature Amount (under 3 years):
            </p>
            <p className="text-2xl font-bold text-orange-400">
              ₹{fdWithdrawInfo.prematureAmount.toFixed(2)}
            </p>
            {fdWithdrawInfo.prematureTransactions.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                ⚠️ Lower interest rate applies
              </p>
            )}
          </div>

          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
            <p className="text-sm text-gray-300">Total FD Balance:</p>
            <p className="text-xl font-bold text-blue-400">
              ₹{fdWithdrawInfo.totalFd.toFixed(2)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label
              htmlFor={`admin-withdraw-${user._id}`}
              className="text-gray-100"
            >
              Amount to Withdraw (₹)
            </Label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={fdWithdrawInfo.totalFd}
              placeholder="0.00"
              name="withdrawAmount"
              id={`admin-withdraw-${user._id}`}
              required
              disabled={loading}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded disabled:opacity-50"
            />
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>
              💡 Mature amount is priority. Interest will be calculated
              accordingly.
            </p>
            <p>• Full interest rate applies to mature FD</p>
            <p>• Reduced interest rate applies to premature withdrawal</p>
          </div>

          <Button
            type="submit"
            disabled={loading || fdWithdrawInfo.totalFd === 0}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              'Withdraw FD'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
