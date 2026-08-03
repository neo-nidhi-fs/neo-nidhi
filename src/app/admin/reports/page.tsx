'use client';

import { useState, useEffect, useMemo } from 'react';
import { LazyHighchartsChart } from '@/components/charts/LazyHighchartsChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Loader,
  TrendingUp,
  BarChart3,
  Users as UsersIcon,
  PieChart,
} from 'lucide-react';

interface ReportData {
  metrics: {
    totalUsers: number;
    totalAdmins: number;
    totalNormalUsers: number;
    totalSavingsBalance: number;
    totalFdBalance: number;
    totalLoanBalance: number;
    totalAccruedSavingInterest: number;
    totalAccruedFdInterest: number;
    totalAccruedLoanInterest: number;
  };
  transactionsByType: {
    [key: string]: number;
  };
  transactionsByTypeAmount: {
    [key: string]: number;
  };
  transactions: Array<{
    amount: number;
    date: string;
    type: string;
  }>;
  schemeWiseDistribution: Array<{
    scheme: string;
    count: number;
  }>;
  monthlyTrends: {
    [key: string]: number;
  };
  balanceRanges: {
    [key: string]: number;
  };
}

function getWeekStart(date: Date) {
  const start = new Date(date);
  const offset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - offset);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getPeriodRange(mode: 'weekly' | 'monthly' | 'yearly', offset: number) {
  const now = new Date();
  const reference = new Date(now);

  if (mode === 'weekly') {
    reference.setDate(reference.getDate() + offset * 7);
    const start = getWeekStart(reference);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    const startLabel = start.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });
    const endLabel = end.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });
    return {
      start,
      end,
      title: `Week of ${startLabel} - ${endLabel}`,
    };
  }

  if (mode === 'monthly') {
    reference.setMonth(reference.getMonth() + offset);
    const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
    const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return {
      start,
      end,
      title: reference.toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      }),
    };
  }

  const year = reference.getFullYear() + offset;
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  end.setHours(23, 59, 59, 999);
  return { start, end, title: String(year) };
}

export default function AdminReports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [transactionMode, setTransactionMode] = useState<
    'weekly' | 'monthly' | 'yearly' | 'till_today'
  >('till_today');
  const [transactionPeriodOffset, setTransactionPeriodOffset] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch('/api/admin/reports');
        const result = await res.json();
        if (result.success) {
          setReportData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    }

    if (mounted) {
      fetchReports();
    }
  }, [mounted]);

  const periodTitle =
    transactionMode === 'till_today'
      ? 'Till today'
      : getPeriodRange(transactionMode, transactionPeriodOffset).title;

  const handleChangeMode = (
    mode: 'weekly' | 'monthly' | 'yearly' | 'till_today'
  ) => {
    setTransactionMode(mode);
    setTransactionPeriodOffset(0);
  };

  const handlePreviousPeriod = () => {
    setTransactionPeriodOffset((offset) => offset - 1);
  };

  const handleNextPeriod = () => {
    setTransactionPeriodOffset((offset) => Math.min(offset + 1, 0));
  };

  const transactionAmountChart = useMemo(() => {
    if (!reportData) {
      return {
        chart: { type: 'column', height: 400, backgroundColor: 'transparent' },
        title: {
          text: 'Transaction Amounts',
          style: { color: '#e5e7eb' },
        },
        xAxis: {
          categories: [],
          labels: { style: { color: '#9ca3af' } },
        },
        yAxis: {
          title: { text: 'Amount (₹)', style: { color: '#9ca3af' } },
          labels: { style: { color: '#9ca3af' } },
        },
        series: [
          {
            name: 'Amount',
            data: [],
            color: '#3b82f6',
          },
        ],
        plotOptions: {
          column: {
            dataLabels: { enabled: false },
          },
        },
      };
    }

    const typeKeys = Object.keys(reportData.transactionsByTypeAmount);
    const filteredPeriodAmounts = typeKeys.reduce<Record<string, number>>(
      (acc, type) => ({ ...acc, [type]: 0 }),
      {}
    );

    if (transactionMode !== 'till_today') {
      const { start, end } = getPeriodRange(transactionMode, transactionPeriodOffset);
      reportData.transactions.forEach((transaction) => {
        const amount = transaction.amount || 0;
        const date = new Date(transaction.date);
        if (Number.isNaN(date.getTime())) return;
        if (date < start || date > end) return;
        if (transaction.type in filteredPeriodAmounts) {
          filteredPeriodAmounts[transaction.type] += amount;
        }
      });
    }

    const categories = typeKeys
      .filter((key) => (transactionMode === 'till_today' ? reportData.transactionsByTypeAmount[key] : filteredPeriodAmounts[key]) > 0)
      .map((key) => key.replace(/_/g, ' '));
    const data = typeKeys
      .filter((key) => (transactionMode === 'till_today' ? reportData.transactionsByTypeAmount[key] : filteredPeriodAmounts[key]) > 0)
      .map((key) => (transactionMode === 'till_today' ? reportData.transactionsByTypeAmount[key] : filteredPeriodAmounts[key]));

    return {
      chart: { type: 'bar', height: 400, backgroundColor: 'transparent' },
      title: {
        text:
          transactionMode === 'till_today'
            ? 'Transaction Amount by Type'
            : `Transaction Amount by Type — ${periodTitle}`,
        style: { color: '#e5e7eb' },
      },
      xAxis: {
        categories,
        labels: { style: { color: '#9ca3af' } },
      },
      yAxis: {
        title: { text: 'Amount (₹)', style: { color: '#9ca3af' } },
        labels: { style: { color: '#9ca3af' } },
      },
      series: [
        {
          name: 'Amount',
          data,
          colorByPoint: true,
        },
      ],
      plotOptions: {
        bar: {
          dataLabels: { enabled: true },
        },
      },
      colors: [
        '#3b82f6',
        '#ef4444',
        '#f59e0b',
        '#10b981',
        '#8b5cf6',
        '#ec4899',
        '#14b8a6',
        '#f97316',
        '#06b6d4',
      ],
    };
  }, [reportData, transactionMode, transactionPeriodOffset, periodTitle]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-b from-slate-950 via-blue-950 to-slate-950">
        <Loader className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-b from-slate-950 via-blue-950 to-slate-950">
        <p className="text-red-400">Failed to load reports data</p>
      </div>
    );
  }

  // 1. Key Metrics Cards
  const metricsCards = [
    {
      label: 'Total Users',
      value: reportData.metrics.totalUsers,
      bgGradient: 'from-blue-900/30 to-indigo-900/30',
      borderColor: 'border-blue-400/30',
      textColor: 'text-blue-400',
    },
    {
      label: 'Total Admins',
      value: reportData.metrics.totalAdmins,
      bgGradient: 'from-purple-900/30 to-indigo-900/30',
      borderColor: 'border-purple-400/30',
      textColor: 'text-purple-400',
    },
    {
      label: 'Active Users',
      value: reportData.metrics.totalNormalUsers,
      bgGradient: 'from-green-900/30 to-emerald-900/30',
      borderColor: 'border-green-400/30',
      textColor: 'text-green-400',
    },
    {
      label: 'Total Savings Balance',
      value: `₹${(reportData.metrics.totalSavingsBalance / 100000).toFixed(2)}L`,
      bgGradient: 'from-cyan-900/30 to-blue-900/30',
      borderColor: 'border-cyan-400/30',
      textColor: 'text-cyan-400',
    },
    {
      label: 'Total FD Balance',
      value: `₹${(reportData.metrics.totalFdBalance / 100000).toFixed(2)}L`,
      bgGradient: 'from-amber-900/30 to-orange-900/30',
      borderColor: 'border-amber-400/30',
      textColor: 'text-amber-400',
    },
    {
      label: 'Total Loan Balance',
      value: `₹${(reportData.metrics.totalLoanBalance / 100000).toFixed(2)}L`,
      bgGradient: 'from-red-900/30 to-pink-900/30',
      borderColor: 'border-red-400/30',
      textColor: 'text-red-400',
    },
  ];
  const seriesData = [
    reportData.metrics.totalAccruedSavingInterest.toFixed(2),
    reportData.metrics.totalAccruedFdInterest.toFixed(2),
    reportData.metrics.totalAccruedLoanInterest.toFixed(2),
  ];
  const seriesDataNumbers = seriesData.map((value) => parseFloat(value));

  // 2. Interest Analysis Chart
  const interestChartOptions = {
    chart: { type: 'column', backgroundColor: 'transparent' },
    title: { text: 'Interest Accrued Summary', style: { color: '#e5e7eb' } },
    xAxis: {
      categories: ['Savings Interest', 'FD Interest', 'Loan Interest'],
      labels: { style: { color: '#9ca3af' } },
    },
    yAxis: {
      title: { text: 'Amount (₹)', style: { color: '#9ca3af' } },
      labels: { style: { color: '#9ca3af' } },
    },
    series: [
      {
        name: 'Total Accrued Interest',
        data: seriesDataNumbers,
      },
    ],
    plotOptions: {
      column: {
        dataLabels: { enabled: true },
        colorByPoint: true,
      },
    },
    colors: ['#10b981', '#3b82f6', '#ef4444'],
  };

  // 3. Transaction Types Distribution (Pie Chart)
  const transactionTypesPie = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: {
      text: 'Transaction Types Distribution (Count)',
      style: { color: '#e5e7eb' },
    },
    series: [
      {
        name: 'Count',
        data: Object.entries(reportData.transactionsByType)
          .filter(([, count]) => count > 0)
          .map(([type, count]) => ({
            name: type.replace(/_/g, ' '),
            y: count,
          })),
      },
    ],
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y}',
        },
      },
    },
  };

  // 4. Transaction Amount by Type (Bar Chart)
  // 5. Scheme-wise User Distribution (Doughnut Chart)
  const schemeDistributionChart = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: 'User Distribution by Scheme', style: { color: '#e5e7eb' } },
    series: [
      {
        name: 'Number of Users',
        data: reportData.schemeWiseDistribution.map((item) => ({
          name: item.scheme.charAt(0).toUpperCase() + item.scheme.slice(1),
          y: item.count,
        })),
      },
    ],
    plotOptions: {
      pie: {
        innerSize: '50%',
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b><br/>Users: {point.y}',
        },
      },
    },
  };

  // 6. Monthly Transaction Trends (Line Chart)
  const monthlyTrendsChart = {
    chart: { type: 'line', backgroundColor: 'transparent' },
    title: {
      text: 'Monthly Transaction Trends (Last 12 Months)',
      style: { color: '#e5e7eb' },
    },
    xAxis: {
      categories: Object.keys(reportData.monthlyTrends),
      labels: { style: { color: '#9ca3af' } },
    },
    yAxis: {
      title: { text: 'Number of Transactions', style: { color: '#9ca3af' } },
      labels: { style: { color: '#9ca3af' } },
    },
    series: [
      {
        name: 'Transactions',
        data: Object.values(reportData.monthlyTrends),
        marker: { enabled: true },
        color: '#3b82f6',
      },
    ],
    plotOptions: {
      line: {
        dataLabels: { enabled: false },
      },
    },
  };

  // 7. User Balance Distribution (Column Chart)
  const balanceDistributionChart = {
    chart: { type: 'column', backgroundColor: 'transparent' },
    title: { text: 'User Balance Distribution', style: { color: '#e5e7eb' } },
    xAxis: {
      categories: Object.keys(reportData.balanceRanges),
      labels: { style: { color: '#9ca3af' } },
    },
    yAxis: {
      title: { text: 'Number of Users', style: { color: '#9ca3af' } },
      labels: { style: { color: '#9ca3af' } },
    },
    series: [
      {
        name: 'Users',
        data: Object.values(reportData.balanceRanges),
        colorByPoint: true,
      },
    ],
    plotOptions: {
      column: {
        dataLabels: { enabled: true },
      },
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  };

  return (
    <main className="bg-linear-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Reports & Analytics
            </span>
          </h1>
          <p className="text-gray-200 text-lg">
            Comprehensive analysis of system metrics and transactions
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {metricsCards.map((card, idx) => (
            <Card
              key={idx}
              className={`bg-linear-to-br ${card.bgGradient} border-2 ${card.borderColor}`}
            >
              <CardHeader className="pb-3">
                <CardTitle className={`text-lg ${card.textColor}`}>
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-white">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        {mounted && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Interest Analysis */}
              <Card className="bg-linear-to-br from-gray-900/50 to-slate-900/50 border-gray-700/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-200 flex items-center gap-2">
                    <TrendingUp size={20} className="text-cyan-400" />
                    Interest Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <LazyHighchartsChart options={interestChartOptions} />
                </CardContent>
              </Card>

              {/* Transaction Types Distribution */}
              <Card className="bg-linear-to-br from-gray-900/50 to-slate-900/50 border-gray-700/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-200 flex items-center gap-2">
                    <PieChart size={20} className="text-purple-400" />
                    Transaction Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <LazyHighchartsChart options={transactionTypesPie} />
                </CardContent>
              </Card>

              {/* Scheme Distribution */}
              <Card className="bg-linear-to-br from-gray-900/50 to-slate-900/50 border-gray-700/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-200 flex items-center gap-2">
                    <BarChart3 size={20} className="text-amber-400" />
                    Scheme Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <LazyHighchartsChart options={schemeDistributionChart} />
                </CardContent>
              </Card>

              {/* User Balance Distribution */}
              <Card className="bg-linear-to-br from-gray-900/50 to-slate-900/50 border-gray-700/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-200 flex items-center gap-2">
                    <UsersIcon size={20} className="text-green-400" />
                    Balance Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <LazyHighchartsChart options={balanceDistributionChart} />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Monthly Transaction Trends */}
              <Card className="bg-linear-to-br from-gray-900/50 to-slate-900/50 border-gray-700/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-200 flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-400" />
                    Monthly Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <LazyHighchartsChart options={monthlyTrendsChart} />
                </CardContent>
              </Card>

              {/* Transaction Amount by Type */}
              <Card className="bg-linear-to-br from-gray-900/50 to-slate-900/50 border-gray-700/30">
                <CardHeader className="pb-2">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-lg text-gray-200 flex items-center gap-2">
                      <BarChart3 size={20} className="text-red-400" />
                      Transaction Amounts
                    </CardTitle>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <select
                        value={transactionMode}
                        onChange={(event) =>
                          handleChangeMode(
                            event.target.value as
                              | 'weekly'
                              | 'monthly'
                              | 'yearly'
                              | 'till_today'
                          )
                        }
                        className="rounded border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition hover:border-slate-500"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="till_today">Till today</option>
                      </select>
                      {transactionMode !== 'till_today' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handlePreviousPeriod}
                            className="rounded border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white transition hover:border-slate-500"
                          >
                            Previous
                          </button>
                          <button
                            type="button"
                            onClick={handleNextPeriod}
                            disabled={transactionPeriodOffset >= 0}
                            className="rounded border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <LazyHighchartsChart options={transactionAmountChart} />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
