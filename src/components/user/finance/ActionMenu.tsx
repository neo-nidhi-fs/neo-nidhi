import { CashFlow } from '@/hooks/useUserFinance';
import { formatCurrency, labelPaymentSource } from '@/lib/utils/finance';
import { Edit2, Trash2, EyeOff, RotateCcw } from 'lucide-react';

export function ActionMenu({
  cashflow,
  onEdit,
  onIgnore,
  onDelete,
  onClose,
  menuRef,
}: {
  cashflow: CashFlow;
  onEdit: () => void;
  onIgnore: () => void;
  onDelete: () => void;
  onClose: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={menuRef}
      className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-md border border-slate-700 bg-slate-950 shadow-lg"
    >
      <button
        onClick={() => {
          onEdit();
          onClose();
        }}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-slate-800"
      >
        <Edit2 size={14} />
        Edit entry
      </button>
      <button
        onClick={() => {
          onIgnore();
          onClose();
        }}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-slate-800"
      >
        <EyeOff size={14} />
        Ignore entry
      </button>
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-300 hover:bg-slate-800"
      >
        <Trash2 size={14} />
        Delete entry
      </button>
    </div>
  );
}
