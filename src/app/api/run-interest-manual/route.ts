// app/api/run-interest-manual/route.ts
import { NextResponse } from 'next/server';
import { processInterest } from '@/jobs/interestCron';

export async function GET() {
  await processInterest(true);
  return NextResponse.json({ status: 'Interest processed manually' });
}
