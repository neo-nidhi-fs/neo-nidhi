'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CashFlow } from '@/hooks/useUserFinance';
import { useLocalStorageArray } from '@/hooks/useLocalStorageArray';
import {
  formatCurrency,
  labelPaymentSource,
  normalizePaymentSource,
  PAYMENT_MODES,
} from '@/lib/utils/finance';
import {
  Trash2,
  Edit2,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  EyeOff,
  RotateCcw,
} from 'lucide-react';
import { ActionMenu } from './ActionMenu';
import { CashFlowTableRow } from './CashFlowTableRow';

interface CashFlowManagerProps {
  cashflows: CashFlow[];
  loading?: boolean;
  onEdit?: (cashflow: CashFlow) => void;
  onDelete?: (cashflowId: string) => void;
  onAddClick?: () => void;
}

function CashFlowSummaryBar({
  formatCurrency,
  totalIncome,
  totalExpense,
  totalRemaining,
  modeTotals,
  showModeBreakdown,
  onToggleModeBreakdown,
  selectedMode,
  onModeToggle,
}: {
  formatCurrency: (value: number) => string;
  totalIncome: number;
  totalExpense: number;
  totalRemaining: number;
  modeTotals: Record<
    'account' | 'cash' | 'card' | 'wallet',
    { income: number; expense: number }
  >;
  showModeBreakdown: boolean;
  onToggleModeBreakdown: () => void;
  selectedMode: 'account' | 'cash' | 'card' | 'wallet' | null;
  onModeToggle: (mode: 'account' | 'cash' | 'card' | 'wallet') => void;
}) {
  const modeLabels: Record<'account' | 'cash' | 'card' | 'wallet', string> = {
    account: 'Account',
    cash: 'Cash',
    card: 'Card',
    wallet: 'Wallet',
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg bg-slate-900/60 border border-slate-600/80 p-4">
        <div className="text-center sm:text-left">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Total income
          </p>
          <p className="text-lg font-semibold text-emerald-400">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Total expense
          </p>
          <p className="text-lg font-semibold text-red-400">
            {formatCurrency(totalExpense)}
          </p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Remaining
          </p>
          <p
            className={`text-lg font-semibold ${totalRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {formatCurrency(totalRemaining)}
          </p>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={onToggleModeBreakdown}
          className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
        >
          {showModeBreakdown ? 'View less' : 'View more'}
        </button>
      </div>

      {showModeBreakdown && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {PAYMENT_MODES.map((mode) => {
            const income = modeTotals[mode].income;
            const expense = modeTotals[mode].expense;
            const remaining = income - expense;
            return (
              <div
                key={mode}
                className={`rounded-lg bg-slate-900/60 border p-4 transition-colors ${
                  selectedMode === mode
                    ? 'border-cyan-400/80 bg-cyan-900/20'
                    : 'border-slate-600/80'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onModeToggle(mode)}
                  className="text-sm font-semibold uppercase tracking-wide text-cyan-300 mb-2 hover:text-cyan-200"
                >
                  {modeLabels[mode]}
                </button>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Income:{' '}
                  <span className="text-emerald-400">
                    {formatCurrency(income)}
                  </span>
                </p>
                <p className="text-xs uppercase tracking-wide text-slate-400 mt-1">
                  Expense:{' '}
                  <span className="text-red-400">
                    {formatCurrency(expense)}
                  </span>
                </p>
                <p
                  className={`text-xs uppercase tracking-wide mt-1 ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  Remaining: {formatCurrency(remaining)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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

function CashflowMobileCard({
  cashflow,
  formatCurrency,
  onEdit,
  onDelete,
}: {
  cashflow: CashFlow;
  formatCurrency: (value: number) => string;
  onEdit?: (c: CashFlow) => void;
  onDelete?: (id: string) => void;
}) {
  const dateStr = new Date(cashflow.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleDeleteClick = () => {
    if (!onDelete) return;
    const confirmed = window.confirm(
      'Delete this transaction? This action cannot be undone.'
    );
    if (!confirmed) return;
    onDelete(cashflow._id);
  };

  return (
    <article
      className="rounded-xl border border-slate-600/80 bg-slate-800/60 p-4 shadow-sm"
      aria-label={`Cashflow ${cashflow.type} ${dateStr}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-600/60 pb-3 mb-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Date
          </p>
          <p className="text-base font-semibold text-white tabular-nums">
            {dateStr}
          </p>
        </div>
        <TypeBadge type={cashflow.type} />
      </div>

      <dl className="space-y-2.5 text-sm">
        <div className="flex gap-3 sm:gap-4">
          <dt className="w-[5.5rem] shrink-0 text-slate-400">Category</dt>
          <dd className="min-w-0 flex-1 text-gray-200 break-words text-right">
            {cashflow.category}
          </dd>
        </div>
        <div className="flex gap-3 sm:gap-4">
          <dt className="w-[5.5rem] shrink-0 text-slate-400">Mode</dt>
          <dd className="min-w-0 flex-1 text-gray-200 text-right">
            {labelPaymentSource(cashflow.paymentSource)}
          </dd>
        </div>
        <div className="flex gap-3 sm:gap-4">
          <dt className="w-[5.5rem] shrink-0 text-slate-400">Source</dt>
          <dd className="min-w-0 flex-1 text-gray-200 break-words text-right">
            {cashflow.source}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-600/60 pt-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Amount
          </p>
          <p
            className={`text-lg font-bold tabular-nums ${cashflow.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {cashflow.type === 'income' ? '+' : '-'}
            {formatCurrency(cashflow.amount)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit && onEdit(cashflow)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-blue-400 hover:bg-blue-400/10 transition-colors"
            aria-label="Edit entry"
          >
            <Edit2 size={18} />
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
            aria-label="Delete entry"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function CashFlowManager({
  cashflows,
  loading = false,
  onEdit,
  onDelete,
  onAddClick,
}: CashFlowManagerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showModeBreakdown, setShowModeBreakdown] = useState(false);
  const [selectedMode, setSelectedMode] = useState<
    'account' | 'cash' | 'card' | 'wallet' | null
  >(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>(
    'all'
  );
  const {
    value: ignoredCashflowIds,
    add: ignoreCashflow,
    remove: unignoreCashflow,
  } = useLocalStorageArray<string>('ignoredCashflowIds', []);
  const [openActionMenuFor, setOpenActionMenuFor] = useState<string | null>(
    null
  );
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openActionMenuFor &&
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setOpenActionMenuFor(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionMenuFor]);

  const monthLabel = (date: Date) =>
    date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const monthlyCashflows = [...cashflows]
    .filter((cashflow) => {
      const cfDate = new Date(cashflow.date);
      return (
        cfDate.getFullYear() === currentMonth.getFullYear() &&
        cfDate.getMonth() === currentMonth.getMonth()
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const matchesFilters = (cf: CashFlow) => {
    if (
      selectedMode &&
      normalizePaymentSource(cf.paymentSource) !== selectedMode
    ) {
      return false;
    }
    if (typeFilter !== 'all' && cf.type !== typeFilter) {
      return false;
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    const dateLabel = new Date(cf.date)
      .toLocaleDateString('en-IN')
      .toLowerCase();
    const haystack = [
      cf.category,
      cf.source,
      cf.type,
      labelPaymentSource(cf.paymentSource),
      String(cf.amount),
      dateLabel,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  };

  const visibleCashflows = monthlyCashflows.filter(
    (cf) => !ignoredCashflowIds.includes(cf._id) && matchesFilters(cf)
  );
  const ignoredCashflows = monthlyCashflows.filter(
    (cf) => ignoredCashflowIds.includes(cf._id) && matchesFilters(cf)
  );

  const totalIncome = visibleCashflows
    .filter((cf) => cf.type === 'income')
    .reduce((sum, cf) => sum + cf.amount, 0);

  const totalExpense = visibleCashflows
    .filter((cf) => cf.type === 'expense')
    .reduce((sum, cf) => sum + cf.amount, 0);

  const modeTotals = monthlyCashflows.reduce<
    Record<
      'account' | 'cash' | 'card' | 'wallet',
      { income: number; expense: number }
    >
  >(
    (acc, cf) => {
      const paymentSource = normalizePaymentSource(cf.paymentSource);
      if (cf.type === 'income') {
        acc[paymentSource].income += cf.amount;
      } else {
        acc[paymentSource].expense += cf.amount;
      }
      return acc;
    },
    {
      account: { income: 0, expense: 0 },
      cash: { income: 0, expense: 0 },
      card: { income: 0, expense: 0 },
      wallet: { income: 0, expense: 0 },
    }
  );

  const totalRemaining = totalIncome - totalExpense;

  const handleModeToggle = (mode: 'account' | 'cash' | 'card' | 'wallet') => {
    setSelectedMode((prev) => (prev === mode ? null : mode));
  };

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const confirmAndDelete = (cashflowId: string) => {
    if (!onDelete) return;
    const confirmed = window.confirm(
      'Delete this transaction? This action cannot be undone.'
    );
    if (!confirmed) return;
    onDelete(cashflowId);
    unignoreCashflow(cashflowId);
  };

  const handleIgnore = (cashflowId: string) => {
    ignoreCashflow(cashflowId);
    setOpenActionMenuFor(null);
  };

  const handleUnignore = (cashflowId: string) => {
    unignoreCashflow(cashflowId);
    setOpenActionMenuFor(null);
  };

  const sortedCashflows = visibleCashflows;

  const now = new Date();
  const isViewingCurrentMonth =
    currentMonth.getFullYear() === now.getFullYear() &&
    currentMonth.getMonth() === now.getMonth();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 backdrop-blur-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-4">
        <h3 className="text-xl font-bold text-white">Income & Expenses</h3>
        <Button
          onClick={onAddClick}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 w-full sm:w-auto"
        >
          + Add Entry
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 border-b border-slate-600">
        <div className="flex items-center justify-center sm:justify-start gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-lg text-white hover:bg-slate-700/80 transition-colors min-h-11 min-w-11 inline-flex items-center justify-center"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="min-w-0 flex-1 text-center text-base sm:text-lg font-semibold text-white tabular-nums px-1">
            {monthLabel(currentMonth)}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-lg text-white hover:bg-slate-700/80 transition-colors min-h-11 min-w-11 inline-flex items-center justify-center"
            aria-label="Next month"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
        {!isViewingCurrentMonth && (
          <Button
            type="button"
            variant="outline"
            onClick={handleToday}
            className="border-slate-500 text-slate-200 hover:bg-slate-700 self-center sm:self-auto w-full sm:w-auto"
          >
            This month
          </Button>
        )}
      </div>

      <div className="mb-6">
        <CashFlowSummaryBar
          formatCurrency={formatCurrency}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          totalRemaining={totalRemaining}
          modeTotals={modeTotals}
          showModeBreakdown={showModeBreakdown}
          onToggleModeBreakdown={() => setShowModeBreakdown((prev) => !prev)}
          selectedMode={selectedMode}
          onModeToggle={handleModeToggle}
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search transactions (category, source, mode, amount, date)"
          className="md:col-span-2 w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          aria-label="Search transactions"
        />
        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as 'all' | 'income' | 'expense')
          }
          className="w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          aria-label="Filter transaction type"
        >
          <option value="all">All types</option>
          <option value="income">Income only</option>
          <option value="expense">Expense only</option>
        </select>
      </div>

      {sortedCashflows.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-300">
            No income or expense entries
            {selectedMode ? ` for ${selectedMode}` : ''} for{' '}
            {monthLabel(currentMonth)}.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {sortedCashflows.map((cashflow) => (
              <CashflowMobileCard
                key={cashflow._id}
                cashflow={cashflow}
                formatCurrency={formatCurrency}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-3 px-3 lg:px-4 font-semibold text-white">
                    Date
                  </th>
                  <th className="text-left py-3 px-3 lg:px-4 font-semibold text-white">
                    Type
                  </th>
                  <th className="text-left py-3 px-3 lg:px-4 font-semibold text-white">
                    Category
                  </th>
                  <th className="text-left py-3 px-3 lg:px-4 font-semibold text-white">
                    Mode
                  </th>
                  <th className="text-left py-3 px-3 lg:px-4 font-semibold text-white">
                    Source
                  </th>
                  <th className="text-right py-3 px-3 lg:px-4 font-semibold text-white">
                    Amount
                  </th>
                  <th className="text-right py-3 px-3 lg:px-4 font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCashflows.map((cashflow) => (
                  <tr
                    key={cashflow._id}
                    className="border-b border-slate-600 hover:bg-slate-700/30 transition-colors"
                  >
                    <CashFlowTableRow
                      cashflow={cashflow}
                      onEdit={() => {}}
                      onIgnore={() => handleIgnore(cashflow._id)}
                      onDelete={() => confirmAndDelete(cashflow._id)}
                      onActionMenuToggle={(id) => setOpenActionMenuFor(id)}
                      isActionMenuOpen={openActionMenuFor === cashflow._id}
                      actionMenuRef={actionMenuRef}
                    >
                      <td className="py-4 px-3 lg:px-4 text-right whitespace-nowrap">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenActionMenuFor(
                                openActionMenuFor === cashflow._id
                                  ? null
                                  : cashflow._id
                              )
                            }
                            className="inline-flex items-center justify-center rounded p-1.5 text-slate-200 hover:bg-slate-700/50"
                            aria-label="Open actions"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openActionMenuFor === cashflow._id && (
                            <ActionMenu
                              cashflow={cashflow}
                              onEdit={() => onEdit && onEdit(cashflow)}
                              onIgnore={() => handleIgnore(cashflow._id)}
                              onDelete={() => confirmAndDelete(cashflow._id)}
                              onClose={() => setOpenActionMenuFor(null)}
                              menuRef={actionMenuRef}
                            />
                          )}
                        </div>
                      </td>
                    </CashFlowTableRow>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {ignoredCashflows.length > 0 && (
        <div className="mt-8 rounded-lg border border-slate-700 bg-slate-900/40 p-4">
          <h4 className="mb-3 text-base font-semibold text-slate-200">
            Ignored Transactions
          </h4>
          <div className="space-y-2">
            {ignoredCashflows.map((cashflow) => (
              <div
                key={`ignored-${cashflow._id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-700/70 bg-slate-900/60 p-3 text-sm"
              >
                <div className="text-slate-200">
                  {new Date(cashflow.date).toLocaleDateString('en-IN')} |{' '}
                  {cashflow.category} |{' '}
                  {labelPaymentSource(cashflow.paymentSource)} |{' '}
                  {cashflow.type === 'income' ? '+' : '-'}
                  {formatCurrency(cashflow.amount)}
                </div>
                <button
                  type="button"
                  onClick={() => handleUnignore(cashflow._id)}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-cyan-300 hover:bg-cyan-400/10"
                >
                  <RotateCcw size={14} />
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
