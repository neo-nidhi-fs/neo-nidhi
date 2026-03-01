'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export function NoChallengesMessage() {
  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 text-center">
      <CardContent className="pt-12 pb-12">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">No challenges available at the moment.</p>
      </CardContent>
    </Card>
  );
}
