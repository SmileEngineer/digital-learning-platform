'use client';

import { SiteVisitTracker } from '@/components/SiteVisitTracker';
import { AuthProvider } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SiteVisitTracker />
      {children}
    </AuthProvider>
  );
}
