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
import { useState } from 'react';

interface ManageFDDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  onTransferToFD: (amount: number) => void;
  onWithdrawFromFD: (amount: number) => void;
  savingsBalance: number;
  fdBalance: number;
}

export function ManageFDDialog({
  open,
  onOpenChange,
  loading,
  onTransferToFD,
  onWithdrawFromFD,
  savingsBalance,
  fdBalance,
}: ManageFDDialogProps) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

  const handleDepositSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('deposit-amount'));

    if (amount > 0 && amount <= savingsBalance) {
      onTransferToFD(amount);
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('withdraw-amount'));

    if (amount > 0 && amount <= fdBalance) {
      onWithdrawFromFD(amount);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Manage Fixed Deposit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Balance Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-400 text-xs font-semibold">Savings</p>
              <p className="text-xl font-bold text-green-300">
                ₹{savingsBalance.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-blue-400 text-xs font-semibold">FD Balance</p>
              <p className="text-xl font-bold text-blue-300">
                ₹{fdBalance.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                activeTab === 'deposit'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Transfer to FD
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                activeTab === 'withdraw'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Withdraw from FD
            </button>
          </div>

          {/* Deposit Form */}
          {activeTab === 'deposit' && (
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <Label htmlFor="deposit-amount" className="text-gray-100">
                  Amount to Transfer (₹)
                </Label>
                <Input
                  id="deposit-amount"
                  name="deposit-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={savingsBalance}
                  required
                  disabled={loading}
                  defaultValue=""
                  placeholder="Enter amount to transfer"
                  className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Max: ₹{savingsBalance.toFixed(2)}
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || savingsBalance <= 0}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Transfer to FD'
                )}
              </Button>
            </form>
          )}

          {/* Withdraw Form */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <Label htmlFor="withdraw-amount" className="text-gray-100">
                  Amount to Withdraw (₹)
                </Label>
                <Input
                  id="withdraw-amount"
                  name="withdraw-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={fdBalance}
                  required
                  disabled={loading}
                  defaultValue=""
                  placeholder="Enter amount to withdraw"
                  className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Max: ₹{fdBalance.toFixed(2)}
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || fdBalance <= 0}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Withdraw from FD'
                )}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
