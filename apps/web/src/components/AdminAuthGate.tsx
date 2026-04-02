'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const routePermissions: Array<{ prefix: string; permission: string }> = [
  { prefix: '/admin/courses', permission: 'courses' },
  { prefix: '/admin/ebooks', permission: 'ebooks' },
  { prefix: '/admin/books', permission: 'books' },
  { prefix: '/admin/live-classes', permission: 'live_classes' },
  { prefix: '/admin/practice-exams', permission: 'practice_exams' },
  { prefix: '/admin/coupons', permission: 'coupons' },
  { prefix: '/admin/articles', permission: 'articles' },
  { prefix: '/admin/orders', permission: 'orders' },
  { prefix: '/admin/analytics', permission: 'analytics' },
  { prefix: '/admin/settings', permission: 'settings' },
  { prefix: '/admin/admin-access', permission: 'admin_access' },
];

function canAccessAdminPath(pathname: string, user: { role: string; adminPermissions?: string[] }) {
  if (user.role === 'super_admin') return true;
  const match = routePermissions.find((entry) => pathname.startsWith(entry.prefix));
  if (!match) return true;
  return (user.adminPermissions ?? []).includes(match.permission);
}

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login?next=/admin');
      return;
    }
    if (user.role !== 'staff' && user.role !== 'admin' && user.role !== 'super_admin') {
      router.replace('/dashboard');
      return;
    }
    if (!canAccessAdminPath(pathname, user)) {
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

  if (
    !user ||
    (user.role !== 'staff' && user.role !== 'admin' && user.role !== 'super_admin') ||
    !canAccessAdminPath(pathname, user)
  ) {
    return null;
  }

  return <>{children}</>;
}
