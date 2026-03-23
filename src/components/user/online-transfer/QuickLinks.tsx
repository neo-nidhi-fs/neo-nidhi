import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Send, DollarSign, CreditCard } from 'lucide-react';

interface QuickLinksProps {
  onDirectTransfer: () => void;
  onManageFD: () => void;
  onPayLoan: () => void;
}

export function QuickLinks({
  onDirectTransfer,
  onManageFD,
  onPayLoan,
}: QuickLinksProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <Link href="/user/qr-transfer">
        <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-400/30 hover:border-green-400/50 transition cursor-pointer h-full">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <QrCode size={24} /> QR Transfer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-sm">Scan QR code to transfer</p>
          </CardContent>
        </Card>
      </Link>

      <Card
        onClick={onDirectTransfer}
        className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-400/30 hover:border-purple-400/50 transition cursor-pointer"
      >
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center gap-2">
            <Send size={24} /> Direct Transfer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 text-sm">Send to another user</p>
        </CardContent>
      </Card>

      <Card
        onClick={onManageFD}
        className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-400/30 hover:border-blue-400/50 transition cursor-pointer"
      >
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center gap-2">
            <DollarSign size={24} /> Manage FD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 text-sm">Fixed Deposit options</p>
        </CardContent>
      </Card>

      <Card
        onClick={onPayLoan}
        className="bg-gradient-to-br from-red-900/30 to-rose-900/30 border-red-400/30 hover:border-red-400/50 transition cursor-pointer"
      >
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <CreditCard size={24} /> Pay Loan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 text-sm">Repay your loan</p>
        </CardContent>
      </Card>
    </div>
  );
}
