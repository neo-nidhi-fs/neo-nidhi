'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader, QrCode, Download } from 'lucide-react';
import { useQRCode } from '@/hooks/useServices';

interface QRCodeDisplayProps {
  userId: string;
  userName: string;
}

export default function QRCodeDisplay({
  userId,
  userName,
}: QRCodeDisplayProps) {
  const [open, setOpen] = useState(false);

  // Use QR Code service via hook - Dependency Inversion
  const { generateQR, downloadQR, qrCode, loading, error } = useQRCode(
    userId,
    userName
  );

  useEffect(() => {
    if (open && !qrCode) {
      generateQR();
    }
  }, [open, qrCode, generateQR]);

  const handleDownload = () => {
    downloadQR(`${userName}-qr-code.png`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 flex items-center gap-2">
          <QrCode size={18} />
          My QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">Your QR Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-300 text-sm text-center">
            Share this QR code with others to receive money transfers
          </p>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : qrCode ? (
            <div className="flex justify-center">
              <Image
                src={qrCode}
                alt="QR Code"
                width={300}
                height={300}
                className="border-4 border-slate-600 rounded-lg"
              />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400">{error}</p>
            </div>
          ) : null}

          <div className="text-center text-gray-300 text-sm">
            <p className="font-semibold">{userName}</p>
            <p className="text-gray-400">User ID: {userId}</p>
          </div>

          {qrCode && (
            <Button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download QR Code
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
