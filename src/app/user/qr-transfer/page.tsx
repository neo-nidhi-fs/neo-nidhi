'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, QrCode, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MPINVerificationDialog from '@/components/MPINVerificationDialog';
import dynamic from 'next/dynamic';

const BarcodeScanner = dynamic(() => import('react-qr-barcode-scanner'), {
  ssr: false,
});

interface ScannedUser {
  userId: string;
  userName: string;
}

interface QRScanResult {
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
  const [cameraError, setCameraError] = useState('');
  const [message, setMessage] = useState('');
  const [showMPINDialog, setShowMPINDialog] = useState(false);
  const [mpinLoading, setMpinLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<
    'granted' | 'denied' | 'prompt' | 'checking'
  >('checking');
  const [checkingPermission, setCheckingPermission] = useState(true);

  // Check camera permission on mount
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        // Check if Permissions API is available
        if (navigator.permissions && navigator.permissions.query) {
          const permission = await navigator.permissions.query({
            name: 'camera' as PermissionName,
          });
          setCameraPermission(
            permission.state as 'granted' | 'denied' | 'prompt'
          );
          setCheckingPermission(false);

          // Listen for permission changes
          permission.addEventListener('change', () => {
            setCameraPermission(
              permission.state as 'granted' | 'denied' | 'prompt'
            );
          });
        } else {
          // Fallback: assume 'prompt' if Permissions API not available
          setCameraPermission('prompt');
          setCheckingPermission(false);
        }
      } catch (err) {
        console.error('Error checking camera permission:', err);
        setCameraPermission('prompt');
        setCheckingPermission(false);
      }
    };

    checkCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      setCheckingPermission(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately after we got permission
      stream.getTracks().forEach((track) => track.stop());
      setCameraPermission('granted');
      setCameraError('');
    } catch (err) {
      setCameraPermission('denied');
      const errorMsg =
        err instanceof Error ? err.message : 'Camera permission denied';
      setCameraError(errorMsg);
    } finally {
      setCheckingPermission(false);
    }
  };

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
      // Get user by ID
      const res = await fetch(`/api/users/${manualUserId}`);
      const data = await res.json();

      if (data.data) {
        setScannedUser({
          userId: data.data._id,
          userName: data.data.name,
        });
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

  const handleQRScan = (result: QRScanResult) => {
    console.log('result ==> ', result);
    setScannedUser({
      userId: result.userId,
      userName: result.userName,
    });
    setStep('amount');
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
    setMpinLoading(true);
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
        // Reset form
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
      setMpinLoading(false);
    }
  };

  const handleConfirmTransfer = () => {
    setShowMPINDialog(true);
  };

  if (step === 'scan') {
    return (
      <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <Link href="/user/dashboard">
              <Button
                variant="ghost"
                className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
              >
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

          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-cyan-400">
                Scan QR Code or Enter User ID
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleScanQRManual} className="space-y-4">
                <div>
                  <Label className="text-gray-300">Recipient User ID</Label>
                  <Input
                    placeholder="Enter or paste the user ID"
                    value={manualUserId}
                    onChange={(e) => setManualUserId(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <Button
                  type="submit"
                  disabled={loading || !manualUserId}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <QrCode size={18} className="mr-2" />
                      Continue
                    </>
                  )}
                </Button>
              </form>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900 text-gray-400">or</span>
                </div>
              </div>

              {cameraError && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 p-3 rounded">
                  {cameraError}
                </p>
              )}

              {checkingPermission ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader
                    size={24}
                    className="animate-spin text-cyan-400 mb-2"
                  />
                  <p className="text-gray-400 text-sm">
                    Checking camera access...
                  </p>
                </div>
              ) : cameraPermission === 'granted' ? (
                <BarcodeScanner
                  width={500}
                  height={500}
                  onUpdate={(err, result) => {
                    if (err) {
                      console.error('Camera error:', err);
                      const errorMsg =
                        err instanceof Error
                          ? err.message
                          : 'Camera access denied. Please check browser permissions.';
                      setCameraError(errorMsg);
                    } else if (result) {
                      setCameraError('');
                      try {
                        const resultData = result as unknown as {
                          text?: string;
                        };
                        const qrData = JSON.parse(resultData.text || '');
                        if (qrData.userId && qrData.userName) {
                          handleQRScan(qrData);
                        }
                      } catch {
                        console.error('Invalid QR code format');
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 space-y-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-400 text-center font-semibold">
                    Camera Access Required
                  </p>
                  <p className="text-gray-300 text-sm text-center">
                    {cameraPermission === 'denied'
                      ? 'Camera permission was denied. Please check your browser settings and allow camera access.'
                      : 'This app needs access to your camera to scan QR codes. Please allow access when prompted.'}
                  </p>
                  <Button
                    onClick={requestCameraPermission}
                    disabled={checkingPermission}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white disabled:opacity-50"
                  >
                    {checkingPermission ? (
                      <>
                        <Loader size={18} className="animate-spin mr-2" />
                        Requesting Camera...
                      </>
                    ) : (
                      <>
                        <QrCode size={18} className="mr-2" />
                        Allow Camera Access
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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
              Sending to{' '}
              <span className="font-semibold">{scannedUser?.userName}</span>
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

        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400">Transfer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-700/30 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">To</span>
                <span className="text-white font-semibold">
                  {scannedUser?.userName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="text-2xl font-bold text-green-400">
                  ₹{amount}
                </span>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {message && <p className="text-green-400 text-sm">{message}</p>}

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setStep('amount');
                  setError('');
                }}
                variant="outline"
                className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
              >
                Edit Amount
              </Button>
              <Button
                onClick={handleConfirmTransfer}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Confirm & Send
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <MPINVerificationDialog
        isOpen={showMPINDialog}
        onClose={() => setShowMPINDialog(false)}
        onVerify={handleTransferWithMPIN}
        isLoading={mpinLoading}
        title="Enter MPIN"
        description="Enter your 4-digit MPIN to confirm this transfer"
      />
    </main>
  );
}
