'use client';

import { useEffect, useMemo, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {
  AlertTriangle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  PieChart,
  Plus,
  Trash2,
  Wallet,
} from 'lucide-react';
import {
  Budget,
  BudgetExpenseCategoryTotal,
  BudgetSummary,
  CashFlow,
} from '@/hooks/useUserFinance';
import { ALL_CASHFLOW_CATEGORIES } from '@/lib/financeCategories';

interface BudgetDashboardProps {
  budgets: Budget[];
  cashFlows: CashFlow[];
  summary: BudgetSummary | null;
  expenseByCategory: BudgetExpenseCategoryTotal[];
  loading?: boolean;
  onRefresh: (month: string) => Promise<void>;
  onAddBudget: (data: {
    month: string;
    category: string;
    amount: number;
    note?: string;
  }) => Promise<unknown>;
  onUpdateBudget: (
    budgetId: string,
    data: Partial<{
      month: string;
      category: string;
      amount: number;
      note?: string;
    }>
  ) => Promise<unknown>;
  onDeleteBudget: (budgetId: string) => Promise<void>;
}

interface BudgetFormState {
  month: string;
  category: string;
  amount: string;
  note: string;
}

function getCurrentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function monthLabel(month: string): string {
  const [yearRaw, monthRaw] = month.split('-');
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw) - 1;
  if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0) {
    return month;
  }
  return new Date(year, monthIndex, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}

function shiftMonth(month: string, delta: number): string {
  const [yearRaw, monthRaw] = month.split('-');
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw) - 1;
  if (Number.isNaN(year) || Number.isNaN(monthIndex)) return month;

  const date = new Date(year, monthIndex, 1);
  date.setMonth(date.getMonth() + delta);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function emptyForm(month: string): BudgetFormState {
  return {
    month,
    category: '',
    amount: '',
    note: '',
  };
}

export default function BudgetDashboard({
  budgets,
  cashFlows,
  summary,
  expenseByCategory,
  loading = false,
  onRefresh,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget,
}: BudgetDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState<BudgetFormState>(() =>
    emptyForm(getCurrentMonthKey())
  );
  const [submitting, setSubmitting] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  useEffect(() => {
    onRefresh(selectedMonth);
  }, [onRefresh, selectedMonth]);

  useEffect(() => {
    if (!showForm) {
      setFormData(emptyForm(selectedMonth));
    }
  }, [showForm, selectedMonth]);

  const totalBudget = summary?.totalBudget || 0;
  const totalSpent = summary?.totalSpent || 0;
  const totalRemaining = summary?.remainingBudget || 0;
  const usagePercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const categoryChartOptions = useMemo<Highcharts.Options>(() => {
    const categories = budgets.map((budget) => budget.category);
    return {
      chart: { type: 'column', backgroundColor: 'transparent' },
      title: {
        text: `Budget vs Spent (${monthLabel(selectedMonth)})`,
        style: { color: '#e5e7eb' },
      },
      xAxis: {
        categories,
        labels: { style: { color: '#9ca3af' } },
      },
      yAxis: {
        min: 0,
        title: { text: 'Amount (INR)', style: { color: '#9ca3af' } },
        labels: { style: { color: '#9ca3af' } },
      },
      legend: { itemStyle: { color: '#d1d5db' } },
      credits: { enabled: false },
      series: [
        {
          type: 'column',
          name: 'Budget',
          data: budgets.map((budget) => budget.amount),
          color: '#38bdf8',
        },
        {
          type: 'column',
          name: 'Spent',
          data: budgets.map((budget) => budget.spent),
          color: '#f97316',
        },
      ],
    };
  }, [budgets, selectedMonth]);

  const expensePieOptions = useMemo<Highcharts.Options>(() => {
    return {
      chart: { type: 'pie', backgroundColor: 'transparent' },
      title: {
        text: `Expense Distribution (${monthLabel(selectedMonth)})`,
        style: { color: '#e5e7eb' },
      },
      legend: {
        itemStyle: { color: '#d1d5db' },
        itemHoverStyle: { color: '#ffffff' },
      },
      credits: { enabled: false },
      series: [
        {
          type: 'pie',
          name: 'Expense',
          data: expenseByCategory.map((item) => ({
            name: item._id,
            y: item.total,
          })),
        },
      ],
    };
  }, [expenseByCategory, selectedMonth]);

  const handleCreateClick = () => {
    setEditingBudget(null);
    setFormData(emptyForm(selectedMonth));
    setShowForm(true);
  };

  const handleEditClick = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      month: budget.month,
      category: budget.category,
      amount: String(budget.amount),
      note: budget.note || '',
    });
    setShowForm(true);
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm('Delete this budget?')) {
      return;
    }
    await onDeleteBudget(budgetId);
    await onRefresh(selectedMonth);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = Number(formData.amount);
    if (!formData.month || !formData.category.trim() || !amount || amount <= 0) {
      alert('Please enter month, category, and a valid amount.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBudget) {
        await onUpdateBudget(editingBudget._id, {
          month: formData.month,
          category: formData.category.trim(),
          amount,
          note: formData.note.trim() || undefined,
        });
      } else {
        await onAddBudget({
          month: formData.month,
          category: formData.category.trim(),
          amount,
          note: formData.note.trim() || undefined,
        });
      }

      setSelectedMonth(formData.month);
      await onRefresh(formData.month);
      setShowForm(false);
      setEditingBudget(null);
      setFormData(emptyForm(formData.month));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreviousMonth = () => {
    setSelectedMonth((prev) => shiftMonth(prev, -1));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => shiftMonth(prev, 1));
  };

  const budgetTransactions = useMemo(() => {
    if (!selectedBudget) return [];
    const targetCategory = selectedBudget.category.trim().toLowerCase();
    return cashFlows
      .filter((cashFlow) => {
        const monthKey = new Date(cashFlow.date).toISOString().slice(0, 7);
        const category = String(cashFlow.category || '').trim().toLowerCase();
        return (
          cashFlow.type === 'expense' &&
          monthKey === selectedBudget.month &&
          category === targetCategory
        );
      })
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }, [cashFlows, selectedBudget]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-white">Budget Dashboard</h3>
          <p className="text-sm text-slate-300">
            Track category-wise budgets and monitor overspending.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePreviousMonth}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-gray-100"
          />
          <button
            type="button"
            onClick={handleNextMonth}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleCreateClick}
            className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-500"
          >
            <Plus className="h-4 w-4" />
            Add Budget
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-600/80 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Total Budget</p>
          <p className="mt-2 text-lg font-semibold text-cyan-300">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="rounded-lg border border-slate-600/80 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Total Spent</p>
          <p className="mt-2 text-lg font-semibold text-orange-300">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="rounded-lg border border-slate-600/80 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Remaining</p>
          <p className={`mt-2 text-lg font-semibold ${totalRemaining >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
            {formatCurrency(totalRemaining)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-600/80 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Overflow Categories</p>
          <p className="mt-2 text-lg font-semibold text-red-300">{summary?.overflowCount || 0}</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-600/80 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-200">Overall usage for {monthLabel(selectedMonth)}</p>
          <p className="text-sm font-medium text-slate-200">{usagePercent.toFixed(1)}%</p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-700">
          <div
            className={`h-full ${usagePercent >= 100 ? 'bg-red-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-600/80 bg-slate-900/70 p-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Month</label>
              <input
                type="month"
                value={formData.month}
                onChange={(e) => setFormData((prev) => ({ ...prev, month: e.target.value }))}
                className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-gray-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-gray-100"
              >
                <option value="">Select a category</option>
                {ALL_CASHFLOW_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Budget Amount</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="0"
                className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-gray-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Note (optional)</label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-gray-100"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : editingBudget ? 'Update Budget' : 'Create Budget'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingBudget(null);
                setFormData(emptyForm(selectedMonth));
              }}
              className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-slate-600/80 bg-slate-900/60 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <h4 className="text-sm font-semibold text-white">Category Budgets</h4>
          {loading && (
            <span className="inline-flex items-center gap-2 text-xs text-slate-300">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading
            </span>
          )}
        </div>
        {budgets.length === 0 ? (
          <div className="px-4 py-10 text-center text-slate-300">
            <Wallet className="mx-auto mb-2 h-6 w-6 text-slate-400" />
            No budgets found for {monthLabel(selectedMonth)}.
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {budgets.map((budget) => {
              const percent = Math.max(0, budget.usagePercent);
              return (
                <div key={budget._id} className="space-y-3 px-4 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedBudget(budget)}
                      className="text-left rounded-md hover:bg-slate-800/60 px-2 py-1 -mx-2 transition-colors"
                    >
                      <p className="font-medium text-white">{budget.category}</p>
                      <p className="text-xs text-slate-400">
                        {monthLabel(budget.month)} | Budget {formatCurrency(budget.amount)} | Spent{' '}
                        {formatCurrency(budget.spent)}
                      </p>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(budget)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBudget(budget._id)}
                        className="inline-flex items-center gap-1 rounded-md border border-red-500/50 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className={`h-full ${percent >= 100 ? 'bg-red-500' : percent >= 80 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-300">{percent.toFixed(1)}% used</span>
                    <span className={budget.remaining >= 0 ? 'text-emerald-300' : 'text-red-300'}>
                      Remaining: {formatCurrency(budget.remaining)}
                    </span>
                  </div>

                  {budget.isOverflow && (
                    <div className="inline-flex items-center gap-1 rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs text-red-200">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Budget overflowed by {formatCurrency(Math.abs(budget.remaining))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center gap-2 text-slate-200">
            <BarChart3 className="h-4 w-4 text-cyan-300" />
            <p className="text-sm font-medium">Budget vs Spent</p>
          </div>
          {budgets.length > 0 ? (
            <HighchartsReact highcharts={Highcharts} options={categoryChartOptions} />
          ) : (
            <p className="text-sm text-slate-400">Add budgets to see this chart.</p>
          )}
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center gap-2 text-slate-200">
            <PieChart className="h-4 w-4 text-orange-300" />
            <p className="text-sm font-medium">Expense by Category</p>
          </div>
          {expenseByCategory.length > 0 ? (
            <HighchartsReact highcharts={Highcharts} options={expensePieOptions} />
          ) : (
            <p className="text-sm text-slate-400">
              No expense data found for this month.
            </p>
          )}
        </div>
      </div>

      {selectedBudget && (
        <div
          className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center"
          onClick={() => setSelectedBudget(null)}
          role="presentation"
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-auto rounded-lg border border-slate-600 bg-slate-900 p-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h5 className="text-lg font-semibold text-white">
                  {selectedBudget.category} Transactions
                </h5>
                <p className="text-sm text-slate-300">
                  {monthLabel(selectedBudget.month)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBudget(null)}
                className="rounded-md border border-slate-600 px-3 py-1 text-sm text-slate-200 hover:bg-slate-800"
              >
                Close
              </button>
            </div>

            {budgetTransactions.length === 0 ? (
              <p className="text-slate-300 text-sm">
                No expense transactions found for this budget.
              </p>
            ) : (
              <div className="divide-y divide-slate-700">
                {budgetTransactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div>
                      <p className="text-sm text-white">{tx.source}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(tx.date).toLocaleDateString('en-IN')} | {tx.paymentSource || 'account'}
                      </p>
                      {tx.note && (
                        <p className="text-xs text-slate-500 mt-1">{tx.note}</p>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-red-300">
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
