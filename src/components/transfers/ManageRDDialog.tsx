'use client';

import { useState } from 'react';
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

interface ManageRDDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  onCreateRD: (monthlyAmount: number, tenureMonths: number) => void;
  savingsBalance: number;
  rdBalance: number;
}

export function ManageRDDialog({
  open,
  onOpenChange,
  loading,
  onCreateRD,
  savingsBalance,
  rdBalance,
}: ManageRDDialogProps) {
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [tenureMonths, setTenureMonths] = useState('12');

  const amountValue = Number(monthlyAmount);
  const tenureValue = Number(tenureMonths);
  const canSubmit =
    amountValue > 0 &&
    amountValue <= savingsBalance &&
    Number.isInteger(tenureValue) &&
    tenureValue > 0;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    onCreateRD(amountValue, tenureValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            Manage Recurring Deposit
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-400 text-xs font-semibold">Savings</p>
              <p className="text-xl font-bold text-green-300">
                ₹{savingsBalance.toFixed(2)}
              </p>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
              <p className="text-cyan-400 text-xs font-semibold">RD Balance</p>
              <p className="text-xl font-bold text-cyan-300">
                ₹{rdBalance.toFixed(2)}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="rd-monthly-amount" className="text-gray-100">
                Monthly Amount (₹)
              </Label>
              <Input
                id="rd-monthly-amount"
                name="rd-monthly-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={savingsBalance}
                required
                disabled={loading}
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                placeholder="Enter monthly amount"
                className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
              />
              <p className="text-xs text-gray-400 mt-1">
                First installment debits now. Max: ₹{savingsBalance.toFixed(2)}
              </p>
            </div>

            <div>
              <Label htmlFor="rd-tenure-months" className="text-gray-100">
                Tenure (months)
              </Label>
              <Input
                id="rd-tenure-months"
                name="rd-tenure-months"
                type="number"
                step="1"
                min="1"
                required
                disabled={loading}
                value={tenureMonths}
                onChange={(e) => setTenureMonths(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Create RD'
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
