import { IUser } from '@/models/User';
import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/userFeatures';

export function enforceFinanceFeatureEnabled(user: IUser) {
  if (!isFeatureEnabled(user, 'financeFeaturesEnabled')) {
    return NextResponse.json(
      { success: false, error: 'Finance features are disabled for this user' },
      { status: 403 }
    );
  }
  return null;
}
