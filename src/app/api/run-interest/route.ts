// app/api/run-interest/route.ts
import { NextResponse } from 'next/server';
import { processInterest } from '@/jobs/interestCron';

export async function GET() {
  await processInterest();
  return NextResponse.json({ status: 'Interest processed' });
}
