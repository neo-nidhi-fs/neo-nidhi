'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from 'lucide-react';

interface PayLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  onSubmit: (amount: number) => void;
  maxAmount: number;
  loanBalance: number;
}

export function PayLoanDialog({
  open,
  onOpenChange,
  loading,
  onSubmit,
  maxAmount,
  loanBalance,
}: PayLoanDialogProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('amount'));

    if (amount > 0 && amount <= maxAmount && amount <= loanBalance) {
      onSubmit(amount);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Pay Loan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm font-semibold">Loan Balance</p>
            <p className="text-2xl font-bold text-red-300">
              ₹{loanBalance.toFixed(2)}
            </p>
          </div>

          <div>
            <Label htmlFor="repay-amount" className="text-gray-100">
              Repayment Amount (₹)
            </Label>
            <Input
              id="repay-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={Math.min(maxAmount, loanBalance)}
              required
              disabled={loading}
              defaultValue=""
              placeholder="Enter amount to repay"
              className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
            />
            <p className="text-xs text-gray-400 mt-1">
              Max: ₹{Math.min(maxAmount, loanBalance).toFixed(2)}
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading || loanBalance <= 0}
            className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
