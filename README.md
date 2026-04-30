# neo-nidhi

`neo-nidhi` is a Next.js app deployed on Vercel, now configured for Android install using both:

- PWA install from Chrome (Add to Home screen)
- Direct APK distribution via TWA packaging
- Native Android app packaging via Capacitor

## Local development

```bash
npm run dev
```

## PWA setup included

- Manifest: `public/manifest.json`
- Service worker: `public/sw.js`
- Offline fallback: `public/offline.html`
- Icons: `public/icons/*`

## Android direct-install setup

### Build config and scripts

- `npm run android:twa:init`
- `npm run android:twa:update`
- `npm run android:twa:release`
- `npm run android:cap:init`
- `npm run android:cap:add`
- `npm run android:cap:build`
- `npm run android:cap:open`

Detailed steps:

- `android/twa/README.md`
- `docs/android-direct-install.md`
- `docs/android-native-capacitor.md`
- `docs/android-sms-auto-finance.md`

### Public install page

The app includes a user-facing install page at:

- `/android`

Configure these Vercel environment variables so the page shows your current release:

- `NEXT_PUBLIC_ANDROID_APK_URL`
- `NEXT_PUBLIC_ANDROID_APK_VERSION`
- `NEXT_PUBLIC_ANDROID_APK_SHA256`
- `NEXT_PUBLIC_ANDROID_APK_UPDATED`
