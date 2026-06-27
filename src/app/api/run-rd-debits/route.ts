import { NextResponse } from 'next/server';
import { processRecurringDepositDebits } from '@/jobs/recurringDepositCron';

export async function GET() {
  const result = await processRecurringDepositDebits();
  return NextResponse.json({ success: true, data: result });
}
