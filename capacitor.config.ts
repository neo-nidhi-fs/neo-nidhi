import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.NEXT_PUBLIC_CAPACITOR_SERVER_URL;

if (!serverUrl) {
  throw new Error(
    'NEXT_PUBLIC_CAPACITOR_SERVER_URL is required for Android builds. Example: https://your-domain.com',
  );
}

const isHttp = serverUrl.startsWith('http://');

const config: CapacitorConfig = {
  appId: 'com.neonidhi.app',
  appName: 'Neo Nidhi',
  webDir: 'public',
  server: {
    url: serverUrl,
    cleartext: isHttp,
  },
  android: {
    allowMixedContent: isHttp,
  },
};

export default config;
