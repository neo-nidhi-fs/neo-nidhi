/**
 * AdminStats Component
 * Responsibility: Display dashboard statistics
 */

'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Settings } from 'lucide-react';

interface AdminStatsProps {
  totalUsers: number;
  totalSchemes: number;
}

export function AdminStats({ totalUsers, totalSchemes }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-400/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-blue-400">Total Users</CardTitle>
            <Users className="text-blue-400" size={24} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{totalUsers}</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-400/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-purple-400">
              Active Schemes
            </CardTitle>
            <Settings className="text-purple-400" size={24} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{totalSchemes}</p>
        </CardContent>
      </Card>
    </div>
  );
}
