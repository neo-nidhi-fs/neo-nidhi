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

interface MPINVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (mpin: string) => Promise<void>;
  isLoading: boolean;
  title?: string;
  description?: string;
}

export default function MPINVerificationDialog({
  isOpen,
  onClose,
  onVerify,
  isLoading,
  title = 'Enter MPIN',
  description = 'Enter your 4-digit MPIN to confirm this transaction',
}: MPINVerificationDialogProps) {
  const [mpin, setMpin] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!mpin || mpin.length !== 4 || !/^\d+$/.test(mpin)) {
      setError('MPIN must be 4 digits');
      return;
    }

    try {
      setError('');
      await onVerify(mpin);
      setMpin('');
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Verification failed');
    }
  };

  const handleClose = () => {
    setMpin('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">{description}</p>

          <div className="space-y-2">
            <Label className="text-gray-300">MPIN</Label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="0000"
              value={mpin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setMpin(value);
              }}
              disabled={isLoading}
              className="bg-slate-700 border-slate-600 text-white text-center text-2xl tracking-widest"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={isLoading || mpin.length !== 4}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
