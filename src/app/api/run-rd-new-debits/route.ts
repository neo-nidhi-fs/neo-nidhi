import { NextResponse } from 'next/server';
import { processRdNewDebits } from '@/jobs/rdNewCron';

export async function GET() {
  const result = await processRdNewDebits();
  return NextResponse.json({ success: true, data: result });
}
