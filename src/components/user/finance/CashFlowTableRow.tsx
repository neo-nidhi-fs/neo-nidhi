import { CashFlow } from '@/hooks/useUserFinance';
import { labelPaymentSource, formatCurrency } from '@/lib/utils/finance';
import { Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

function TypeBadge({ type }: { type: CashFlow['type'] }) {
  if (type === 'income') {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <TrendingUp
          size={18}
          className="text-emerald-600 dark:text-emerald-400"
        />
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-300">
          Income
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 shrink-0">
      <TrendingDown size={18} className="text-destructive" />
      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-300">
        Expense
      </span>
    </div>
  );
}

export function CashFlowTableRow({
  cashflow,
  onEdit,
  onIgnore,
  onDelete,
  onActionMenuToggle,
  isActionMenuOpen,
  actionMenuRef,
  children,
}: {
  cashflow: CashFlow;
  onEdit: (c: CashFlow) => void;
  onIgnore: (id: string) => void;
  onDelete: (id: string) => void;
  onActionMenuToggle: (id: string | null) => void;
  isActionMenuOpen: boolean;
  actionMenuRef: React.RefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
}) {
  return (
    <>
      <td className="py-4 px-3 lg:px-4 text-gray-200 whitespace-nowrap">
        {new Date(cashflow.date).toLocaleDateString('en-IN')}
      </td>
      <td className="py-4 px-3 lg:px-4">
        <TypeBadge type={cashflow.type} />
      </td>
      <td className="py-4 px-3 lg:px-4 text-gray-200 max-w-[10rem] lg:max-w-none truncate lg:whitespace-normal lg:break-words">
        {cashflow.category}
      </td>
      <td className="py-4 px-3 lg:px-4 text-gray-200 whitespace-nowrap">
        {labelPaymentSource(cashflow.paymentSource)}
      </td>
      <td className="py-4 px-3 lg:px-4 text-gray-200 max-w-[8rem] lg:max-w-[12rem] truncate lg:whitespace-normal lg:break-words">
        {cashflow.source}
      </td>
      <td
        className={`py-4 px-3 lg:px-4 text-right font-semibold whitespace-nowrap ${
          cashflow.type === 'income'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-destructive'
        }`}
      >
        {cashflow.type === 'income' ? '+' : '-'}
        {formatCurrency(cashflow.amount)}
      </td>
      {children}
    </>
  );
}
