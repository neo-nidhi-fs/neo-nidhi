'use client';

import { SessionProvider } from 'next-auth/react';

type AppProvidersProps = {
  children: React.ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
