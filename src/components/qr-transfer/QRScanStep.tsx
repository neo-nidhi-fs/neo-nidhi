'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, QrCode } from 'lucide-react';

interface QRScanStepProps {
  loading: boolean;
  error: string;
  manualUserId: string;
  onManualUserIdChange: (value: string) => void;
  onManualSubmit: (e: React.FormEvent) => void;
}

export function QRScanStep({
  loading,
  error,
  manualUserId,
  onManualUserIdChange,
  onManualSubmit,
}: QRScanStepProps) {
  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-cyan-400">Scan QR Code or Enter User ID</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onManualSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-300">Recipient User ID</Label>
            <Input
              placeholder="Enter or paste the user ID"
              value={manualUserId}
              onChange={(e) => onManualUserIdChange(e.target.value)}
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
      </CardContent>
    </Card>
  );
}
