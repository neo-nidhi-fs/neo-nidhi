# Android direct install workflow

## 1) Build APK from TWA

1. Ensure `android/twa/twa-manifest.json` exists (`npm run android:twa:init` once).
2. Build release:

```bash
npm run android:twa:release
```

3. Collect generated APK and record:
- app version
- file size
- SHA-256 checksum

## 2) Publish APK

1. Upload APK to your secure hosting location (for example private S3 bucket + signed URL or protected file host).
2. Set these Vercel env vars:
- `NEXT_PUBLIC_ANDROID_APK_URL`
- `NEXT_PUBLIC_ANDROID_APK_VERSION`
- `NEXT_PUBLIC_ANDROID_APK_SHA256`
- `NEXT_PUBLIC_ANDROID_APK_UPDATED` (YYYY-MM-DD)
3. Redeploy Vercel.

## 3) User distribution

Share this page with users:

- `/android`

It includes download link, version, checksum, and install steps for unknown sources.

## 4) Update process

For every release:

1. Bump Android version in `twa-manifest.json`.
2. Rebuild APK.
3. Upload new APK.
4. Update env vars and redeploy.
5. Notify users to install the new version.
