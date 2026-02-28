'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Scan } from 'lucide-react';

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
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQRCodeDetection = async (imageFile: File) => {
    try {
      // For QR code detection, you would typically use jsQR or similar library
      // For now, we'll provide a fallback approach
      const reader = new FileReader();
      reader.onload = async (e) => {
        // This is a simplified approach - in production, use jsQR library
        try {
          // Placeholder for QR decoding
          // In production: use jsQR((imageData) => { ... })
          console.log('QR Code file loaded:', e.target?.result);
          if (onScan) {
            // This would be called when QR code is successfully decoded
          }
        } catch {
          setError('Failed to decode QR code');
        }
      };
      reader.readAsDataURL(imageFile);
    } catch {
      setError('Error processing QR code');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleQRCodeDetection(file);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center gap-2">
          <Scan size={18} />
          Scan QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Scan QR Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-300 text-sm">
            Upload the QR code image or use your camera
          </p>

          <div className="flex gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white flex items-center justify-center gap-2"
            >
              <Scan size={18} />
              Upload QR Code
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <p className="text-gray-400 text-xs text-center">
            For QR scanning, upload an image of the QR code
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
