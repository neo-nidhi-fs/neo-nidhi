'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader } from 'lucide-react';

interface TransferConfirmationProps {
  toUserName: string;
  amount: number;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function TransferConfirmation({
  toUserName,
  amount,
  loading,
  onConfirm,
  onCancel,
}: TransferConfirmationProps) {
  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
      <CardContent className="pt-6 space-y-4">
        <div className="bg-slate-700/30 p-4 rounded-lg space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">To</span>
            <span className="text-white font-semibold">{toUserName}</span>
          </div>
          <div className="border-t border-slate-600"></div>
          <div className="flex justify-between">
            <span className="text-gray-400">Amount</span>
            <span className="text-white font-semibold">₹{amount.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            disabled={loading}
            variant="outline"
            className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Transfer'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
