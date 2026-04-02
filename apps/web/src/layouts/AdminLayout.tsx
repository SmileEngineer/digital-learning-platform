'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Video,
  ClipboardList,
  BookMarked,
  Ticket,
  Newspaper,
  Package,
  BarChart3,
  LogOut,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/courses', icon: BookOpen, label: 'Manage Courses', permission: 'courses' },
  { path: '/admin/ebooks', icon: FileText, label: 'Manage eBooks', permission: 'ebooks' },
  { path: '/admin/books', icon: BookMarked, label: 'Manage Books', permission: 'books' },
  { path: '/admin/live-classes', icon: Video, label: 'Live Classes', permission: 'live_classes' },
  { path: '/admin/practice-exams', icon: ClipboardList, label: 'Practice Exams', permission: 'practice_exams' },
  { path: '/admin/coupons', icon: Ticket, label: 'Coupons', permission: 'coupons' },
  { path: '/admin/articles', icon: Newspaper, label: 'Articles', permission: 'articles' },
  { path: '/admin/orders', icon: Package, label: 'Orders', permission: 'orders' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics', permission: 'analytics' },
  { path: '/admin/admin-access', icon: ShieldCheck, label: 'Admin Access', permission: 'admin_access' },
];

const navGroups: Array<{ label: string; items: string[] }> = [
  { label: 'Overview', items: ['/admin'] },
  { label: 'Learning Catalog', items: ['/admin/courses', '/admin/ebooks', '/admin/books', '/admin/live-classes', '/admin/practice-exams'] },
  { label: 'Marketing', items: ['/admin/coupons', '/admin/articles'] },
  { label: 'Operations', items: ['/admin/orders', '/admin/analytics', '/admin/admin-access'] },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const visibleNavItems =
    user?.role === 'super_admin'
      ? navItems
      : navItems.filter((item) => !item.permission || (user?.adminPermissions ?? []).includes(item.permission));
  const pageTitle = visibleNavItems.find((item) => item.path === pathname)?.label ?? 'Admin Workspace';

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 text-white shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 ring-1 ring-indigo-400/30">
              <GraduationCap className="h-6 w-6 text-indigo-200" />
            </div>
            <div>
              <span className="block text-xl font-semibold tracking-tight">LearnHub Admin</span>
              <span className="text-xs text-slate-400">Streamlined content and operations workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 md:block">
                {user.name} • {user.role.replace('_', ' ')}
              </div>
            ) : null}
            <Link href="/" className="text-sm text-slate-300 transition hover:text-white">
              View Site
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push('/');
              }}
              className="flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6 lg:px-6">
        <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-72 shrink-0 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm xl:block">
          <div className="rounded-2xl bg-slate-950 px-4 py-4 text-white">
            <div className="text-xs uppercase tracking-[0.2em] text-indigo-200">Current workspace</div>
            <div className="mt-2 text-lg font-semibold">{pageTitle}</div>
            <div className="mt-1 text-sm text-slate-300">Use the grouped navigation to move between admin modules quickly.</div>
          </div>
          <nav className="mt-5 space-y-5">
            {navGroups.map((group) => {
              const items = visibleNavItems.filter((item) => group.items.includes(item.path));
              if (items.length === 0) return null;

              return (
                <div key={group.label}>
                  <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {group.label}
                  </div>
                  <ul className="space-y-1.5">
                    {items.map((item) => {
                      const isActive = pathname === item.path;
                      const Icon = item.icon;

                      return (
                        <li key={item.path}>
                          <Link
                            href={item.path}
                            className={`flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition ${
                              isActive
                                ? 'bg-slate-950 text-white shadow-sm'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`} />
                              <span>{item.label}</span>
                            </span>
                            <ChevronRight className={`h-4 w-4 ${isActive ? 'text-indigo-200' : 'text-slate-300'}`} />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm xl:hidden">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm transition ${
                    isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
