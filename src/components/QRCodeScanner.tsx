'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Scan, X } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const jsQR = require('jsqr');

interface ScanResult {
  userId: string;
  userName: string;
  type: string;
}

interface QRCodeScannerProps {
  onScan?: (result: ScanResult) => void;
}

export default function QRCodeScanner({ onScan }: QRCodeScannerProps) {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);

  const startCamera = async () => {
    try {
      setError('');
      setMessage('Starting camera...');
      scanningRef.current = true;
      setScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setMessage('Camera ready - point at QR code');
      scanQRCode();
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to access camera';
      setError(errorMsg);
      setScanning(false);
      setMessage('');
      console.error('Camera error:', err);
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !scanningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const detectQR = () => {
      if (!scanningRef.current || !videoRef.current) return;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      try {
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code) {
          // Successfully decoded QR code
          try {
            const result = JSON.parse(code.data);
            if (result.userId && result.userName && result.type) {
              stopCamera();
              setMessage(`✅ Scanned: ${result.userName}`);
              if (onScan) {
                onScan(result);
              }
              return;
            }
          } catch {
            setError('Invalid QR code format');
          }
        }
      } catch (err) {
        console.error('QR decode error:', err);
      }

      // Continue scanning
      if (scanningRef.current) {
        requestAnimationFrame(detectQR);
      }
    };

    detectQR();
  };

  const stopCamera = () => {
    scanningRef.current = false;
    setScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      stopCamera();
      setError('');
      setMessage('');
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center gap-2">
          <Scan size={18} />
          Scan QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Scan QR Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {scanning ? (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-80 object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              </div>
              <canvas ref={canvasRef} className="hidden" />

              {message && (
                <p className="text-cyan-400 text-sm text-center font-semibold">
                  {message}
                </p>
              )}

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <Button
                onClick={stopCamera}
                className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
              >
                <X size={18} />
                Stop Scanning
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm text-center">
                Point your camera at someone&apos;s QR code to transfer money
              </p>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <Button
                onClick={startCamera}
                disabled={scanning}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Scan size={18} />
                Start Camera
              </Button>

              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900 text-gray-400">or</span>
                </div>
              </div>

              <p className="text-gray-400 text-xs text-center">
                📸 Make sure camera has permission and good lighting for QR
                scanning
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
