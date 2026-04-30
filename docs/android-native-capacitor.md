# Native Android app (Capacitor) for Neo-Nidhi

This setup builds Neo-Nidhi as an installable native Android app and allows access to Android features through Capacitor plugins.

## What this gives you

- Installable app on Android phones (APK/AAB)
- Native APIs (Camera, Device info, Geolocation)
- Reuse of the existing Next.js UI
- Works with your deployed Next.js backend (SSR/API routes)

## Set app web URL

Set this env variable before sync/build (required):

```bash
NEXT_PUBLIC_CAPACITOR_SERVER_URL=https://your-production-domain.com
```

Capacitor will load this URL in the native shell.

On Windows PowerShell:

```powershell
$env:NEXT_PUBLIC_CAPACITOR_SERVER_URL="https://your-production-domain.com"
pnpm android:cap:sync
```

If this variable is missing, the build now fails early with a clear error instead of launching a blank screen.

## One-time setup

1. Install dependencies:

```bash
pnpm install
```

2. Initialize Capacitor project files:

```bash
pnpm android:cap:init
```

3. Add Android native project:

```bash
pnpm android:cap:add
```

## Sync native plugins into Android

```bash
pnpm android:cap:build
```
This syncs Capacitor config and native plugins to the Android project.

## Open in Android Studio

```bash
pnpm android:cap:open
```

Then in Android Studio:

1. Let Gradle sync complete.
2. Connect a phone (USB debugging on) or start emulator.
3. Click Run to install debug APK.

## Release build (for distribution)

In Android Studio:

1. Build `Generate Signed Bundle / APK`.
2. Choose Android App Bundle (`.aab`) for Play Store, or signed APK for direct install.
3. Use your production keystore.

## Native feature access from code

Use utilities from:

- `src/lib/native/index.ts`

Included helpers:

- `capturePhotoAsDataUrl()`
- `getCurrentNativeLocation()`
- `getNativeDeviceSnapshot()`
- `isNativeApp()`

These functions return `null` or `false` on web, so they are safe in shared code paths.
