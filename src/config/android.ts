export const androidRelease = {
  version: process.env.NEXT_PUBLIC_ANDROID_APK_VERSION ?? 'v1.0.0',
  apkUrl:
    process.env.NEXT_PUBLIC_ANDROID_APK_URL ??
    'https://example.com/downloads/neo-nidhi.apk',
  checksumSha256:
    process.env.NEXT_PUBLIC_ANDROID_APK_SHA256 ??
    'REPLACE_WITH_RELEASE_SHA256',
  lastUpdated: process.env.NEXT_PUBLIC_ANDROID_APK_UPDATED ?? '2026-04-15',
};
