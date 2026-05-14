import { NextResponse } from 'next/server';
import { revaluateOnlineAssets } from '@/jobs/assetRevaluationCron';

export async function GET() {
  const result = await revaluateOnlineAssets();
  return NextResponse.json({
    status: 'Asset revaluation processed',
    result,
  });
}
