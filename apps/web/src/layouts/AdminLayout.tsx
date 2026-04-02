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

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const visibleNavItems =
    user?.role === 'super_admin'
      ? navItems
      : navItems.filter((item) => !item.permission || (user?.adminPermissions ?? []).includes(item.permission));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white sticky top-0 z-40">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8" />
            <div>
              <span className="text-xl block">LearnHub Admin</span>
              <span className="text-xs text-slate-400">Content Management System</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && <span className="text-xs text-slate-400">{user.name}</span>}
            <Link href="/" className="text-slate-300 hover:text-white text-sm">
              View Site
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push('/');
              }}
              className="flex items-center gap-2 text-slate-300 hover:text-white text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4">
            <ul className="space-y-1">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;

                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
