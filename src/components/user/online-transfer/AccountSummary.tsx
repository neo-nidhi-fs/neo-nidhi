import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type BalanceUser = {
  savingsBalance: number;
  fd: number;
  rd?: number;
  loanBalance: number;
};

interface AccountSummaryProps {
  user: BalanceUser;
}

export function AccountSummary({ user }: AccountSummaryProps) {
  const items = [
    { label: 'Savings', value: user.savingsBalance, color: 'text-green-400' },
    { label: 'FD Balance', value: user.fd, color: 'text-blue-400' },
    { label: 'RD Balance', value: user.rd || 0, color: 'text-cyan-400' },
    { label: 'Loan', value: user.loanBalance, color: 'text-red-400' },
    {
      label: 'Net Worth',
      value: user.savingsBalance + user.fd + (user.rd || 0) - user.loanBalance,
      color: 'text-purple-400',
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-cyan-400">Account Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={item.label} className="bg-slate-700/30 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">{item.label}</p>
              <p className={`text-2xl font-bold ${item.color}`}>
                ₹{(item.value || 0).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

