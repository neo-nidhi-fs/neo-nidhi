import { NextResponse } from 'next/server';
import { recalculateAccruedInterestMonthToDate } from '@/jobs/interestCron';

export async function POST() {
  try {
    const result = await recalculateAccruedInterestMonthToDate();
    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      message: `Replaced accrued interest for ${result.usersUpdated} users (${result.daysElapsed} day(s) in month, current balances/rates).`,
      usersUpdated: result.usersUpdated,
      daysElapsed: result.daysElapsed,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('recalculate-accrued-interest:', msg);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
