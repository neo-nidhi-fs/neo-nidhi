import type { IUserFeatures } from '@/models/User';
import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/userFeatures';

type FeatureUserLike = {
  features?: Partial<IUserFeatures> | null;
  financeFeaturesEnabled?: boolean;
};

export function enforceFinanceFeatureEnabled(user: FeatureUserLike) {
  if (!isFeatureEnabled(user, 'financeFeaturesEnabled')) {
    return NextResponse.json(
      { success: false, error: 'Finance features are disabled for this user' },
      { status: 403 }
    );
  }
  return null;
}
