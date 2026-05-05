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

interface MoneyTransferFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  onSubmit: (toUserName: string, amount: number) => void;
  title: string;
  description: string;
  icon?: React.ReactNode;
  maxAmount?: number;
  initialRecipient?: string;
}

export function MoneyTransferForm({
  open,
  onOpenChange,
  loading,
  onSubmit,
  title,
  description,
  icon,
  maxAmount,
  initialRecipient,
}: MoneyTransferFormProps) {
  const [toUserName, setToUserName] = useState(initialRecipient ?? '');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = toUserName.trim();
    const amountValue = Number(amount);

    if (trimmedName && amountValue > 0) {
      if (maxAmount && amountValue > maxAmount) {
        alert(`Amount cannot exceed ?${maxAmount}`);
        return;
      }
      onSubmit(trimmedName, amountValue);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-6 flex items-center gap-2">
          {icon}
          {title}
        </Button>
      </DialogTrigger> */}
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-gray-300 text-sm">{description}</p>
          <div>
            <Label htmlFor="toUserName" className="text-gray-100">
              Recipient Name
            </Label>
            <Input
              id="toUserName"
              name="toUserName"
              required
              disabled={loading}
              value={toUserName}
              onChange={(e) => setToUserName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
            />
          </div>
          <div>
            <Label htmlFor="amount" className="text-gray-100">
              Amount (?)
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              required
              disabled={loading}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white disabled:opacity-50"
            />
            {maxAmount && (
              <p className="text-xs text-gray-400 mt-1">
                Max: ?{maxAmount.toFixed(2)}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Proceed'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
