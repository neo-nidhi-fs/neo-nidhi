'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type Highcharts from 'highcharts';
import type { Options } from 'highcharts';

const HighchartsReact = dynamic(() => import('highcharts-react-official'), {
  ssr: false,
  loading: () => <ChartFallback />,
});

function ChartFallback() {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-slate-700/40 bg-slate-950/40 text-sm text-gray-400">
      Loading chart...
    </div>
  );
}

type LazyHighchartsChartProps = {
  options: any;
  className?: string;
  fallbackClassName?: string;
};

export function LazyHighchartsChart({
  options,
  className,
  fallbackClassName,
}: LazyHighchartsChartProps) {
  const [highcharts, setHighcharts] = useState<typeof Highcharts | null>(null);

  useEffect(() => {
    let active = true;

    void import('highcharts').then((module) => {
      if (active) {
        setHighcharts((module as { default: typeof Highcharts }).default);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  if (!highcharts) {
    return (
      <div
        className={
          fallbackClassName ??
          'flex min-h-[280px] items-center justify-center rounded-lg border border-slate-700/40 bg-slate-950/40 text-sm text-gray-400'
        }
      >
        Loading chart...
      </div>
    );
  }

  return (
    <div className={className}>
      <HighchartsReact highcharts={highcharts} options={options} />
    </div>
  );
}

