/**
 * DashboardHeader Component
 * Responsibility: Display dashboard header and navigation
 */

'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trophy, BarChart3 } from 'lucide-react';

interface DashboardHeaderProps {
  message: string;
}

export function DashboardHeader({ message }: DashboardHeaderProps) {
  return (
    <div className="mb-12">
      <h1 className="text-5xl font-black mb-2">
        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Admin Dashboard
        </span>
      </h1>
      <p className="text-gray-200 text-lg mb-4">
        Manage users, schemes, and platform settings
      </p>
      <div className="flex gap-4 flex-wrap">
        <Link href="/admin/challenges">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
            <Trophy size={18} />
            Manage Challenges
          </Button>
        </Link>
        <Link href="/admin/reports">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
            <BarChart3 size={18} />
            View Reports
          </Button>
        </Link>
        <Link href="/api/run-manual-interest">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
            <BarChart3 size={18} />
            Run interest Manually
          </Button>
        </Link>
      </div>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
