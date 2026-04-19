'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ArrowLeft, BarChart3, CalendarDays, Loader, TrendingUp } from 'lucide-react';
import { useUser } from '@/hooks/useServices';
import { CashFlow, useUserFinance } from '@/hooks/useUserFinance';
import { getUserFeatures } from '@/lib/userFeatures';

type Aggregation = {
  income: number;
  expense: number;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function monthLabelFromKey(monthKey: string): string {
  const [yearRaw, monthRaw] = monthKey.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
}

function aggregateCashflows(cashFlows: CashFlow[]) {
  const monthlyMap: Record<string, Aggregation> = {};
  const yearlyMap: Record<string, Aggregation> = {};
  const quarterlyMap: Record<string, Aggregation> = {};
  const expenseByCategory: Record<string, number> = {};
  const paymentSourceMap: Record<string, number> = {};

  cashFlows.forEach((entry) => {
    const date = new Date(entry.date);
    if (Number.isNaN(date.getTime())) return;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;
    const yearKey = String(year);
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    const quarterKey = `${year}-Q${quarter}`;

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { income: 0, expense: 0 };
    }

    if (!yearlyMap[yearKey]) {
      yearlyMap[yearKey] = { income: 0, expense: 0 };
    }
    if (!quarterlyMap[quarterKey]) {
      quarterlyMap[quarterKey] = { income: 0, expense: 0 };
    }

    if (entry.type === 'income') {
      monthlyMap[monthKey].income += entry.amount;
      yearlyMap[yearKey].income += entry.amount;
      quarterlyMap[quarterKey].income += entry.amount;
      return;
    }

    monthlyMap[monthKey].expense += entry.amount;
    yearlyMap[yearKey].expense += entry.amount;
    quarterlyMap[quarterKey].expense += entry.amount;

    const category = entry.category || 'Other Expense';
    expenseByCategory[category] = (expenseByCategory[category] || 0) + entry.amount;
    const source = entry.paymentSource || 'account';
    paymentSourceMap[source] = (paymentSourceMap[source] || 0) + entry.amount;
  });

  const monthlyEntries = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      key,
      label: monthLabelFromKey(key),
      income: value.income,
      expense: value.expense,
      savings: value.income - value.expense,
    }));

  const yearlyEntries = Object.entries(yearlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      key,
      income: value.income,
      expense: value.expense,
      savings: value.income - value.expense,
    }));

  const expenseCategories = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, y: value }));

  const paymentSourceEntries = Object.entries(paymentSourceMap).map(
    ([key, value]) => ({
      key,
      label: key.replace('_', ' ').toUpperCase(),
      value,
    })
  );

  const quarterlyEntries = Object.entries(quarterlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      key,
      income: value.income,
      expense: value.expense,
      savings: value.income - value.expense,
    }));

  return {
    monthlyEntries,
    yearlyEntries,
    quarterlyEntries,
    expenseCategories,
    paymentSourceEntries,
  };
}

export default function IncomeExpenseReportPage() {
  const [userId, setUserId] = useState<string>('');
  const [pageLoading, setPageLoading] = useState(true);
  const [userInitialized, setUserInitialized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [financeFeatureEnabled, setFinanceFeatureEnabled] = useState(false);

  const { user, fetchUser } = useUser(userId);
  const { cashFlows, fetchCashFlows, loading, error } = useUserFinance();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function initializeUser() {
      try {
        const res = await fetch('/api/auth/session');
        const session = await res.json();
        if (session?.user?.id) {
          setUserId(session.user.id);
        }
      } catch (err) {
        console.error('Error initializing user:', err);
      } finally {
        setPageLoading(false);
      }
    }

    initializeUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    async function loadData() {
      try {
        await fetchUser();
      } finally {
        setUserInitialized(true);
      }
    }

    loadData();
  }, [userId, fetchUser]);

  useEffect(() => {
    setFinanceFeatureEnabled(getUserFeatures(user).financeFeaturesEnabled);
  }, [user]);

  useEffect(() => {
    if (!financeFeatureEnabled) return;
    fetchCashFlows();
  }, [financeFeatureEnabled, fetchCashFlows]);

  const {
    monthlyEntries,
    yearlyEntries,
    quarterlyEntries,
    expenseCategories,
    paymentSourceEntries,
  } = useMemo(
    () => aggregateCashflows(cashFlows),
    [cashFlows]
  );

  const overview = useMemo(() => {
    const totalIncome = cashFlows
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);

    const totalExpense = cashFlows
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    const bestSavingsMonth = monthlyEntries.reduce<{
      label: string;
      value: number;
    } | null>((best, current) => {
      if (!best || current.savings > best.value) {
        return { label: current.label, value: current.savings };
      }
      return best;
    }, null);

    const highestExpenseMonth = monthlyEntries.reduce<{
      label: string;
      value: number;
    } | null>((best, current) => {
      if (!best || current.expense > best.value) {
        return { label: current.label, value: current.expense };
      }
      return best;
    }, null);

    return {
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate,
      bestSavingsMonth,
      highestExpenseMonth,
    };
  }, [cashFlows, monthlyEntries]);

  const monthlyChartOptions: Highcharts.Options = {
    chart: { type: 'column', backgroundColor: 'transparent' },
    title: { text: 'Monthly Income vs Expense', style: { color: '#e5e7eb' } },
    xAxis: {
      categories: monthlyEntries.map((entry) => entry.label),
      labels: { style: { color: '#9ca3af' } },
    },
    yAxis: {
      title: { text: 'Amount (INR)', style: { color: '#9ca3af' } },
      labels: { style: { color: '#9ca3af' } },
    },
    legend: {
      itemStyle: { color: '#d1d5db' },
      itemHoverStyle: { color: '#ffffff' },
    },
    series: [
      {
        type: 'column',
        name: 'Income',
        data: monthlyEntries.map((entry) => entry.income),
        color: '#10b981',
      },
      {
        type: 'column',
        name: 'Expense',
        data: monthlyEntries.map((entry) => entry.expense),
        color: '#ef4444',
      },
      {
        type: 'line',
        name: 'Savings',
        data: monthlyEntries.map((entry) => entry.savings),
        color: '#38bdf8',
        marker: { enabled: true, radius: 3 },
      },
    ],
    credits: { enabled: false },
  };

  const yearlyChartOptions: Highcharts.Options = {
    chart: { type: 'bar', backgroundColor: 'transparent' },
    title: { text: 'Yearly Income and Expense', style: { color: '#e5e7eb' } },
    xAxis: {
      categories: yearlyEntries.map((entry) => entry.key),
      labels: { style: { color: '#9ca3af' } },
    },
    yAxis: {
      title: { text: 'Amount (INR)', style: { color: '#9ca3af' } },
      labels: { style: { color: '#9ca3af' } },
    },
    legend: {
      itemStyle: { color: '#d1d5db' },
      itemHoverStyle: { color: '#ffffff' },
    },
    series: [
      {
        type: 'bar',
        name: 'Income',
        data: yearlyEntries.map((entry) => entry.income),
        color: '#22c55e',
      },
      {
        type: 'bar',
        name: 'Expense',
        data: yearlyEntries.map((entry) => entry.expense),
        color: '#f97316',
      },
      {
        type: 'bar',
        name: 'Savings',
        data: yearlyEntries.map((entry) => entry.savings),
        color: '#0ea5e9',
      },
    ],
    credits: { enabled: false },
  };

  const expenseCategoryOptions: Highcharts.Options = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: 'Top Expense Categories', style: { color: '#e5e7eb' } },
    legend: {
      itemStyle: { color: '#d1d5db' },
      itemHoverStyle: { color: '#ffffff' },
    },
    series: [
      {
        type: 'pie',
        name: 'Expense Share',
        data: expenseCategories,
      },
    ],
    plotOptions: {
      pie: {
        dataLabels: {
          enabled: true,
          style: { color: '#e5e7eb' },
          format: '{point.name}: {point.percentage:.1f}%',
        },
      },
    },
    credits: { enabled: false },
  };

  const quarterlyChartOptions: Highcharts.Options = {
    chart: { type: 'column', backgroundColor: 'transparent' },
    title: { text: 'Quarterly Savings Trend', style: { color: '#e5e7eb' } },
    xAxis: {
      categories: quarterlyEntries.map((entry) => entry.key),
      labels: { style: { color: '#9ca3af' } },
    },
    yAxis: {
      title: { text: 'Amount (INR)', style: { color: '#9ca3af' } },
      labels: { style: { color: '#9ca3af' } },
    },
    series: [
      {
        type: 'column',
        name: 'Quarterly Savings',
        data: quarterlyEntries.map((entry) => entry.savings),
        color: '#14b8a6',
      },
    ],
    credits: { enabled: false },
  };

  const cumulativeSavings = monthlyEntries.reduce<number[]>(
    (acc, entry) => {
      const previous = acc.length > 0 ? acc[acc.length - 1] : 0;
      acc.push(previous + entry.savings);
      return acc;
    },
    []
  );

  const cumulativeSavingsOptions: Highcharts.Options = {
    chart: { type: 'area', backgroundColor: 'transparent' },
    title: {
      text: 'Cumulative Savings Progression',
      style: { color: '#e5e7eb' },
    },
    xAxis: {
      categories: monthlyEntries.map((entry) => entry.label),
      labels: { style: { color: '#9ca3af' } },
    },
    yAxis: {
      title: { text: 'Cumulative Savings (INR)', style: { color: '#9ca3af' } },
      labels: { style: { color: '#9ca3af' } },
    },
    series: [
      {
        type: 'area',
        name: 'Cumulative Savings',
        data: cumulativeSavings,
        color: '#22c55e',
      },
    ],
    credits: { enabled: false },
  };

  const monthlySavingsRateOptions: Highcharts.Options = {
    chart: { type: 'line', backgroundColor: 'transparent' },
    title: {
      text: 'Monthly Savings Rate (%)',
      style: { color: '#e5e7eb' },
    },
    xAxis: {
      categories: monthlyEntries.map((entry) => entry.label),
      labels: { style: { color: '#9ca3af' } },
    },
    yAxis: {
      title: { text: 'Savings Rate %', style: { color: '#9ca3af' } },
      labels: { style: { color: '#9ca3af' } },
    },
    series: [
      {
        type: 'line',
        name: 'Savings Rate',
        data: monthlyEntries.map((entry) =>
          entry.income > 0 ? Number(((entry.savings / entry.income) * 100).toFixed(2)) : 0
        ),
        color: '#a855f7',
        marker: { enabled: true, radius: 3 },
      },
    ],
    credits: { enabled: false },
  };

  const paymentSourceOptions: Highcharts.Options = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: 'Expense by Payment Mode', style: { color: '#e5e7eb' } },
    legend: {
      itemStyle: { color: '#d1d5db' },
      itemHoverStyle: { color: '#ffffff' },
    },
    series: [
      {
        type: 'pie',
        name: 'Expense',
        data: paymentSourceEntries.map((entry) => ({
          name: entry.label,
          y: entry.value,
        })),
      },
    ],
    plotOptions: {
      pie: {
        dataLabels: {
          enabled: true,
          style: { color: '#e5e7eb' },
          format: '{point.name}: {point.percentage:.1f}%',
        },
      },
    },
    credits: { enabled: false },
  };

  if (pageLoading || !userId || !userInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!financeFeatureEnabled) {
    return (
      <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/user/personal-finance"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Personal Finance
          </Link>
          <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-6 text-gray-300">
            Income/expense reporting is available only when Personal Finance is enabled.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Income/Expense Report</h1>
            <p className="text-gray-200 mt-1">
              Graphical analysis of your monthly and yearly cashflow performance.
            </p>
          </div>
          <Link
            href="/user/personal-finance"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-gray-100 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Personal Finance
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-900/10 p-4">
            <div className="flex items-center gap-2 text-emerald-300 text-sm">
              <TrendingUp className="w-4 h-4" /> Total Income
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(overview.totalIncome)}</p>
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-900/10 p-4">
            <div className="flex items-center gap-2 text-red-300 text-sm">
              <BarChart3 className="w-4 h-4" /> Total Expense
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(overview.totalExpense)}</p>
          </div>
          <div className="rounded-lg border border-cyan-500/30 bg-cyan-900/10 p-4">
            <div className="flex items-center gap-2 text-cyan-300 text-sm">
              <CalendarDays className="w-4 h-4" /> Net Savings
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(overview.netSavings)}</p>
          </div>
          <div className="rounded-lg border border-blue-500/30 bg-blue-900/10 p-4">
            <div className="flex items-center gap-2 text-blue-300 text-sm">
              <TrendingUp className="w-4 h-4" /> Savings Rate
            </div>
            <p className="text-2xl font-bold mt-2">{overview.savingsRate.toFixed(1)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
            <p className="text-sm text-gray-300">Best Savings Month</p>
            <p className="text-lg font-semibold mt-1">
              {overview.bestSavingsMonth
                ? `${overview.bestSavingsMonth.label} (${formatCurrency(overview.bestSavingsMonth.value)})`
                : 'Not enough data'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
            <p className="text-sm text-gray-300">Highest Expense Month</p>
            <p className="text-lg font-semibold mt-1">
              {overview.highestExpenseMonth
                ? `${overview.highestExpenseMonth.label} (${formatCurrency(overview.highestExpenseMonth.value)})`
                : 'Not enough data'}
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-500/40 bg-red-900/10 p-4 mb-6 text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && monthlyEntries.length === 0 && (
          <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-6 text-gray-300">
            No income/expense entries found yet. Add cashflow entries in Personal Finance to see monthly and yearly analysis.
          </div>
        )}

        {!loading && !error && monthlyEntries.length > 0 && mounted && (
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
              <HighchartsReact highcharts={Highcharts} options={monthlyChartOptions} />
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
              <HighchartsReact highcharts={Highcharts} options={yearlyChartOptions} />
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
              <HighchartsReact highcharts={Highcharts} options={expenseCategoryOptions} />
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
              <HighchartsReact highcharts={Highcharts} options={quarterlyChartOptions} />
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
              <HighchartsReact highcharts={Highcharts} options={cumulativeSavingsOptions} />
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
              <HighchartsReact highcharts={Highcharts} options={monthlySavingsRateOptions} />
            </div>
            {paymentSourceEntries.length > 0 && (
              <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
                <HighchartsReact highcharts={Highcharts} options={paymentSourceOptions} />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
