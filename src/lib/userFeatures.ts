export const FEATURE_KEYS = [
  'financeFeaturesEnabled',
  'creditScoreEnabled',
  'androidAppEnabled',
  'onlineTransferEnabled',
  'quizzesEnabled',
  'challengesEnabled',
  'rdNewEnabled',
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export type UserFeatures = Record<FeatureKey, boolean>;

export const DEFAULT_USER_FEATURES: UserFeatures = {
  financeFeaturesEnabled: false,
  creditScoreEnabled: false,
  androidAppEnabled: false,
  onlineTransferEnabled: false,
  quizzesEnabled: false,
  challengesEnabled: false,
  rdNewEnabled: false,
};

type UserLike = {
  features?: Partial<UserFeatures> | null;
  financeFeaturesEnabled?: boolean;
};

export function getUserFeatures(user?: UserLike | null): UserFeatures {
  const featuresFromUser = user?.features ?? {};

  return {
    ...DEFAULT_USER_FEATURES,
    ...featuresFromUser,
    // Backward compatibility with old root-level field
    financeFeaturesEnabled:
      featuresFromUser.financeFeaturesEnabled ??
      user?.financeFeaturesEnabled ??
      DEFAULT_USER_FEATURES.financeFeaturesEnabled,
  };
}

export function isFeatureEnabled(
  user: UserLike | null | undefined,
  key: FeatureKey
): boolean {
  return getUserFeatures(user)[key];
}
