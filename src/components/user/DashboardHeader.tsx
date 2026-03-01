'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

export function DashboardHeader({ userName }: { userName: string }) {
  return (
    <div className="mb-12">
      <h1 className="text-5xl font-black mb-2">
        Welcome,{' '}
        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          {userName}
        </span>
        👋
      </h1>
      <p className="text-gray-200 text-lg mb-4">
        Manage your finances and track your progress
      </p>
      <Link href="/user/reports">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 flex items-center gap-2">
          <BarChart3 size={18} />
          View Your Reports
        </Button>
      </Link>
    </div>
  );
}
