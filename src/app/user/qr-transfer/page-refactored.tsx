'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, QrCode, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MPINVerificationDialog from '@/components/MPINVerificationDialog';
import { QRScanStep } from '@/components/qr-transfer/QRScanStep';
import { TransferConfirmation } from '@/components/transfers/TransferConfirmation';

interface ScannedUser {
  userId: string;
  userName: string;
}

export default function QRTransferPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState<'scan' | 'amount' | 'confirm'>('scan');
  const [scannedUser, setScannedUser] = useState<ScannedUser | null>(null);
  const [amount, setAmount] = useState('');
  const [manualUserId, setManualUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showMPINDialog, setShowMPINDialog] = useState(false);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-gray-100">Please log in to transfer money</p>
      </div>
    );
  }

  const handleScanQRManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/users/${manualUserId}`);
      const data = await res.json();

      if (data.data) {
        setScannedUser({ userId: data.data._id, userName: data.data.name });
        setManualUserId('');
        setStep('amount');
      } else {
        setError('User not found');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const parsedAmount = parseFloat(amount);
    if (!amount || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setStep('confirm');
  };

  const handleTransferWithMPIN = async (mpin: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/transactions/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: session.user?.id,
          toUserName: scannedUser?.userName,
          amount: parseFloat(amount),
          mpin,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        setTimeout(() => {
          setStep('scan');
          setScannedUser(null);
          setAmount('');
          setMessage('');
          setShowMPINDialog(false);
        }, 2000);
      } else {
        setError(data.error);
        setShowMPINDialog(false);
      }
    } catch (err) {
      setError((err as Error).message);
      setShowMPINDialog(false);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'scan') {
    return (
      <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <Link href="/user/dashboard">
              <Button variant="ghost" className="text-gray-400 hover:text-white mb-6 flex items-center gap-2">
                <ArrowLeft size={18} />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-black mb-2">
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
                <QrCode size={32} />
                QR Transfer
              </span>
            </h1>
            <p className="text-gray-200">Scan or enter recipient details</p>
          </div>

          <QRScanStep
            loading={loading}
            error={error}
            manualUserId={manualUserId}
            onManualUserIdChange={setManualUserId}
            onManualSubmit={handleScanQRManual}
          />
        </div>
      </main>
    );
  }

  if (step === 'amount') {
    return (
      <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-black mb-2">
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Transfer Amount
              </span>
            </h1>
            <p className="text-gray-200">
              Sending to <span className="font-semibold">{scannedUser?.userName}</span>
            </p>
          </div>

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
            <CardContent className="pt-6">
              <form onSubmit={handleAmountSubmit} className="space-y-4">
                <div>
                  <Label className="text-gray-300">Amount (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white text-2xl font-bold text-center py-4"
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    onClick={() => {
                      setStep('scan');
                      setScannedUser(null);
                      setAmount('');
                      setError('');
                    }}
                    variant="outline"
                    className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !amount}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send size={18} className="mr-2" />
                        Proceed
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2">
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Confirm Transfer
            </span>
          </h1>
        </div>

        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 mb-4">
          <CardContent className="pt-6">
            {message && (
              <p
                className={`p-3 rounded-lg text-sm mb-4 ${
                  message.includes('✅')
                    ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
              >
                {message}
              </p>
            )}

            <TransferConfirmation
              toUserName={scannedUser?.userName || ''}
              amount={parseFloat(amount) || 0}
              loading={loading}
              onConfirm={() => setShowMPINDialog(true)}
              onCancel={() => {
                setStep('amount');
                setError('');
              }}
            />
          </CardContent>
        </Card>

        {showMPINDialog && (
          <MPINVerificationDialog
            isOpen={showMPINDialog}
            onClose={() => setShowMPINDialog(false)}
            onVerify={handleTransferWithMPIN}
            isLoading={loading}
          />
        )}
      </div>
    </main>
  );
}
