'use client';

import { SiteVisitTracker } from '@/components/SiteVisitTracker';
import { AuthProvider } from '@/contexts/AuthContext';
import { SiteConfigProvider } from '@/contexts/SiteConfigContext';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SiteConfigProvider>
      <AuthProvider>
        <SiteVisitTracker />
        {children}
      </AuthProvider>
    </SiteConfigProvider>
  );
}
