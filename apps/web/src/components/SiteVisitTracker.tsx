'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { trackSiteVisit } from '@/lib/platform-api';

export function SiteVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    void trackSiteVisit({ path: pathname, referrer }).catch(() => {
      // Ignore telemetry errors so page navigation is never blocked.
    });
  }, [pathname]);

  return null;
}
