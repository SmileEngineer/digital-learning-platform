'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

function isAdminRole(role: string | undefined): boolean {
  return role === 'staff' || role === 'admin' || role === 'super_admin';
}

export function DashboardAuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login?next=/dashboard');
      return;
    }
    if (isAdminRole(user.role)) {
      router.replace('/admin');
    }
  }, [loading, pathname, router, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading…
      </div>
    );
  }

  if (!user || isAdminRole(user.role)) {
    return null;
  }

  return <>{children}</>;
}
