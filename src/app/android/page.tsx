import Link from 'next/link';
import { androidRelease } from '@/config/android';

export default function AndroidInstallPage() {
  const hasRealChecksum = androidRelease.checksumSha256 !== 'REPLACE_WITH_RELEASE_SHA256';

  return (
    <main className="min-h-[calc(100vh-140px)] bg-slate-950 text-slate-100 px-6 py-10">
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
        <h1 className="text-3xl font-bold text-cyan-300">Install neo-nidhi on Android</h1>
        <p className="mt-2 text-slate-300">
          Download the signed APK and install it directly on your Android phone.
        </p>

        <div className="mt-6 grid gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm">
          <p>
            <span className="text-slate-400">Version:</span> {androidRelease.version}
          </p>
          <p>
            <span className="text-slate-400">Last updated:</span> {androidRelease.lastUpdated}
          </p>
          <p className="break-all">
            <span className="text-slate-400">SHA-256:</span>{' '}
            {hasRealChecksum ? androidRelease.checksumSha256 : 'Will be published with the release build'}
          </p>
        </div>

        <div className="mt-6">
          <a
            href={androidRelease.apkUrl}
            className="inline-flex rounded-lg bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            Download APK
          </a>
        </div>

        <div className="mt-8 space-y-4 text-sm text-slate-200">
          <h2 className="text-lg font-semibold text-cyan-200">Install steps</h2>
          <p>1. Download the APK on your Android device.</p>
          <p>2. Open the file and allow installation from unknown sources when prompted.</p>
          <p>3. Finish installation and open neo-nidhi from your app drawer.</p>
          <p>4. On future releases, install the newer APK to update the app.</p>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Want browser install instead? Use Chrome and tap menu {'>'} Add to Home screen.
        </p>
        <Link href="/" className="mt-2 inline-block text-xs text-cyan-300 hover:text-cyan-200">
          Back to home
        </Link>
      </section>
    </main>
  );
}
