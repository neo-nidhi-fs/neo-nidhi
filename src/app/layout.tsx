import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AppProviders from '@/components/AppProviders';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import content from '@/content/content.json';

export const metadata: Metadata = {
  title: {
    default: content.app.slug,
    template: `%s | ${content.app.slug}`,
  },
  description: content.app.description,
  applicationName: content.app.slug,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: content.app.slug,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192' }],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: '#1e293b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <AppProviders>
          <Navbar />
          {children}
          <Footer />
          <ServiceWorkerRegistration />
        </AppProviders>
      </body>
    </html>
  );
}
