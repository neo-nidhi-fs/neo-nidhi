'use client';

import { useState, useEffect } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Loader,
  TrendingUp,
  BarChart3,
  PieChart,
  Wallet,
  DollarSign,
  CreditCard,
} from 'lucide-react';

interface UserReportData {
  user: {
    name: string;
    savingsBalance: number;
    fdBalance: number;
    loanBalance: number;
  };
  metrics: {
    totalDeposits: number;
    totalWithdrawals: number;
    totalLoans: number;
    totalRepayments: number;
    totalFdDeposits: number;
    totalFdWithdrawals: number;
    totalInterestEarned: number;
    totalInterestAccrued: number;
    netSavings: number;
    netFd: number;
    netLoan: number;
    totalTransactions: number;
    recentTransactionCount: number;
  };
  transactionsByType: {
    [key: string]: number;
  };
  monthlyTrends: {
    [key: string]: number;
  };
  monthlySavings: {
    [key: string]: number;
  };
  interestBreakdown: {
    savingsInterest: number;
    fdInterest: number;
    loanInterest: number;
  };
}

export default function UserReports() {
  const [reportData, setReportData] = useState<UserReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch('/api/user/reports');
        const result = await res.json();

        if (result.success) {
          setReportData(result.data);
        } else {
          setError(result.error || 'Failed to load reports data');
          console.error('API Error:', result.error);
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Failed to fetch reports';
        setError(errorMsg);
        console.error('Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    }

    if (mounted) {
      fetchReports();
    }
  }, [mounted]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
        <Loader className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!reportData || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 px-4">
        <p className="text-red-400 text-lg mb-4">
          {error || 'Failed to load reports data'}
        </p>
        <a
          href="/user/dashboard"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          Back to Dashboard
        </a>
      </div>
    );
  }

  // Key metrics cards
  const metricsCards = [
    {
      label: 'Current Savings',
      value: `₹${reportData.user.savingsBalance.toFixed(2)}`,
      bgGradient: 'from-green-900/30 to-emerald-900/30',
      borderColor: 'border-green-400/30',
      textColor: 'text-green-400',
      icon: Wallet,
    },
    {
      label: 'Current FD Balance',
      value: `₹${reportData.user.fdBalance.toFixed(2)}`,
      bgGradient: 'from-amber-900/30 to-orange-900/30',
      borderColor: 'border-amber-400/30',
      textColor: 'text-amber-400',
      icon: DollarSign,
    },
    {
      label: 'Active Loan Balance',
      value: `₹${reportData.user.loanBalance.toFixed(2)}`,
      bgGradient: 'from-red-900/30 to-pink-900/30',
      borderColor: 'border-red-400/30',
      textColor: 'text-red-400',
      icon: CreditCard,
    },
  ];

  // Quick stats cards
  const quickStats = [
    {
      label: 'Total Deposits',
      value: `₹${reportData.metrics.totalDeposits.toFixed(2)}`,
      bgGradient: 'from-blue-900/30 to-cyan-900/30',
      borderColor: 'border-blue-400/30',
      textColor: 'text-blue-400',
    },
    {
      label: 'Total Withdrawals',
      value: `₹${reportData.metrics.totalWithdrawals.toFixed(2)}`,
      bgGradient: 'from-purple-900/30 to-indigo-900/30',
      borderColor: 'border-purple-400/30',
      textColor: 'text-purple-400',
    },
    {
      label: 'Interest Earned',
      value: `₹${reportData.metrics.totalInterestEarned.toFixed(2)}`,
      bgGradient: 'from-cyan-900/30 to-teal-900/30',
      borderColor: 'border-cyan-400/30',
      textColor: 'text-cyan-400',
    },
    {
      label: 'Total Transactions',
      value: reportData.metrics.totalTransactions,
      bgGradient: 'from-violet-900/30 to-purple-900/30',
      borderColor: 'border-violet-400/30',
      textColor: 'text-violet-400',
    },
  ];

  // Transaction summary chart
  const transactionSummaryChart = {
    chart: { type: 'column', backgroundColor: 'transparent' },
    title: { text: 'Transaction Summary', style: { color: '#e5e7eb' } },
    xAxis: {
      categories: ['Deposits', 'Withdrawals', 'Loans', 'Repayments'],
      labels: { style: { color: '#9ca3af' } },
    },
    yAxis: {
      title: { text: 'Amount (₹)', style: { color: '#9ca3af' } },
      labels: { style: { color: '#9ca3af' } },
    },
    series: [
      {
        name: 'Amount',
        data: [
          reportData.metrics.totalDeposits,
          reportData.metrics.totalWithdrawals,
          reportData.metrics.totalLoans,
          reportData.metrics.totalRepayments,
        ],
      },
    ],
    plotOptions: {
      column: {
        dataLabels: { enabled: true },
        colorByPoint: true,
      },
    },
    colors: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'],
  };

  // Transaction types pie chart
  const transactionTypesPie = {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: {
      text: 'Transaction Types Distribution',
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
          style: { color: '#e5e7eb' },
        },
      },
    },
  };

  // Interest breakdown chart
  const interestChart = {
    chart: { type: 'bar', backgroundColor: 'transparent', height: 300 },
    title: { text: 'Interest Breakdown', style: { color: '#e5e7eb' } },
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
        name: 'Interest Amount',
        data: [
          reportData.interestBreakdown.savingsInterest,
          reportData.interestBreakdown.fdInterest,
          reportData.interestBreakdown.loanInterest,
        ],
        colorByPoint: true,
      },
    ],
    plotOptions: {
      bar: {
        dataLabels: { enabled: true },
      },
    },
    colors: ['#10b981', '#f59e0b', '#ef4444'],
  };

  // Monthly savings trend
  const monthlySavingsChart = {
    chart: { type: 'area', backgroundColor: 'transparent' },
    title: { text: 'Monthly Savings Trend', style: { color: '#e5e7eb' } },
    xAxis: {
      categories: Object.keys(reportData.monthlySavings),
      labels: { style: { color: '#9ca3af' } },
    },
    yAxis: {
      title: { text: 'Net Savings (₹)', style: { color: '#9ca3af' } },
      labels: { style: { color: '#9ca3af' } },
    },
    series: [
      {
        name: 'Savings',
        data: Object.values(reportData.monthlySavings),
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(16, 185, 129, 0.5)'],
            [1, 'rgba(16, 185, 129, 0)'],
          ],
        },
        lineWidth: 2,
        marker: { enabled: true },
      },
    ],
    plotOptions: {
      area: {
        stacking: 'normal',
      },
    },
  };

  // Monthly transaction trends
  const monthlyTransactionsChart = {
    chart: { type: 'line', backgroundColor: 'transparent' },
    title: {
      text: 'Monthly Transaction Trends',
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

  return (
    <main className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Your Financial Reports
            </span>
          </h1>
          <p className="text-gray-200 text-lg">
            Detailed analysis of your savings, investments, and transactions
          </p>
        </div>

        {/* Current Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {metricsCards.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <Card
                key={idx}
                className={`bg-gradient-to-br ${card.bgGradient} border-2 ${card.borderColor}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-lg ${card.textColor}`}>
                      {card.label}
                    </CardTitle>
                    <IconComponent size={24} className={card.textColor} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{card.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {quickStats.map((stat, idx) => (
            <Card
              key={idx}
              className={`bg-gradient-to-br ${stat.bgGradient} border-2 ${stat.borderColor}`}
            >
              <CardHeader className="pb-3">
                <CardTitle className={`text-sm ${stat.textColor}`}>
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        {mounted && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Transaction Summary */}
              <Card className="bg-gradient-to-br from-gray-900/50 to-slate-900/50 border-gray-700/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-200 flex items-center gap-2">
                    <BarChart3 size={20} className="text-blue-400" />
                    Transaction Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={transactionSummaryChart}
                  />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-900/50 to-slate-900/50 border-gray-700/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-200 flex items-center gap-2">
                    <PieChart size={20} className="text-purple-400" />
                    Transaction Types
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={transactionTypesPie}
                  />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-900/50 to-slate-900/50 border-gray-700/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-200 flex items-center gap-2">
                    <DollarSign size={20} className="text-amber-400" />
                    Interest Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={interestChart}
                  />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-900/50 to-slate-900/50 border-gray-700/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-200 flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-400" />
                    Savings Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={monthlySavingsChart}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-gradient-to-br from-gray-900/50 to-slate-900/50 border-gray-700/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-200 flex items-center gap-2">
                    <TrendingUp size={20} className="text-cyan-400" />
                    Monthly Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={monthlyTransactionsChart}
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
