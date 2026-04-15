# neo-nidhi Android (TWA) build

This folder stores Bubblewrap config for packaging the deployed Vercel app as an Android app.

## Prerequisites

- Node.js 20+
- JDK 17 (or allow Bubblewrap to install one on first run)
- Android SDK + build tools

## First-time setup

1. Replace `YOUR-VERCEL-DOMAIN` in the init command with your live domain.
2. Run:

```bash
npm run android:twa:init
```

This generates `android/twa/twa-manifest.json` and Android project files.

## Build release artifact

```bash
npm run android:twa:release
```

Bubblewrap outputs signed release artifacts in the generated Android project directories.

## Update after web app changes

When PWA metadata or domain details change:

```bash
npm run android:twa:update
npm run android:twa:release
```

## Keystore and signing

- Create and store your release keystore securely.
- Keep keystore alias/password outside git and inject through secure environment variables or local gradle properties.
