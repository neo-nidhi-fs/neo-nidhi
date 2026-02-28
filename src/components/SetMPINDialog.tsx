'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, Lock } from 'lucide-react';

interface SetMPINDialogProps {
  userId: string;
  hasMPIN: boolean;
  onMPINSet: () => void;
}

export default function SetMPINDialog({
  userId,
  hasMPIN,
  onMPINSet,
}: SetMPINDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'initial' | 'old' | 'new' | 'confirm'>(
    'initial'
  );
  const [oldMPin, setOldMPin] = useState('');
  const [newMPin, setNewMPin] = useState('');
  const [confirmMPin, setConfirmMPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleClose = () => {
    setOpen(false);
    setStep('initial');
    setOldMPin('');
    setNewMPin('');
    setConfirmMPin('');
    setError('');
    setMessage('');
  };

  const handleNext = () => {
    setError('');
    if (hasMPIN && step === 'initial') {
      setStep('old');
    } else if (step === 'old') {
      setStep('new');
    } else if (step === 'new') {
      if (!newMPin || newMPin.length !== 4 || !/^\d+$/.test(newMPin)) {
        setError('MPIN must be 4 digits');
        return;
      }
      setStep('confirm');
    } else if (step === 'confirm') {
      handleSetMPIN();
    } else if (step === 'initial') {
      setStep('new');
    }
  };

  const handleSetMPIN = async () => {
    if (newMPin !== confirmMPin) {
      setError('MPINs do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/mpin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newMPin,
          oldMPin: hasMPIN ? oldMPin : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => {
          onMPINSet();
          handleClose();
        }, 1500);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex items-center gap-2">
          <Lock size={18} />
          {hasMPIN ? 'Change MPIN' : 'Set MPIN'}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">
            {hasMPIN ? 'Change MPIN' : 'Set Your MPIN'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {hasMPIN && step === 'old' && (
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">Enter your current MPIN</p>
              <Label className="text-gray-300">Current MPIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="0000"
                value={oldMPin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setOldMPin(value);
                }}
                className="bg-slate-700 border-slate-600 text-white text-center text-2xl tracking-widest"
              />
            </div>
          )}

          {(step === 'new' || (!hasMPIN && step === 'initial')) && (
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">Create a new 4-digit MPIN</p>
              <Label className="text-gray-300">New MPIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="0000"
                value={newMPin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setNewMPin(value);
                }}
                className="bg-slate-700 border-slate-600 text-white text-center text-2xl tracking-widest"
              />
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">Confirm your MPIN</p>
              <Label className="text-gray-300">Confirm MPIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="0000"
                value={confirmMPin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setConfirmMPin(value);
                }}
                className="bg-slate-700 border-slate-600 text-white text-center text-2xl tracking-widest"
              />
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-green-400 text-sm">{message}</p>}

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              disabled={
                loading ||
                (step === 'old' && oldMPin.length !== 4) ||
                (step === 'new' && newMPin.length !== 4) ||
                (step === 'confirm' && confirmMPin.length !== 4)
              }
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
