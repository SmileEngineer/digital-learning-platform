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
  Package,
  User,
  Lock,
  Bell,
  LogOut,
  GraduationCap,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { path: '/dashboard/courses', icon: BookOpen, label: 'My Courses' },
  { path: '/dashboard/ebooks', icon: FileText, label: 'My eBooks' },
  { path: '/dashboard/live-classes', icon: Video, label: 'Live Classes' },
  { path: '/dashboard/practice-exams', icon: ClipboardList, label: 'Practice Exams' },
  { path: '/dashboard/orders', icon: Package, label: 'My Orders' },
  { path: '/dashboard/profile', icon: User, label: 'Profile' },
  { path: '/dashboard/change-password', icon: Lock, label: 'Password' },
  { path: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <span className="text-xl">Kantri Lawyer</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-600 hover:text-slate-900 text-sm">
              Back to Site
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push('/');
              }}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm"
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
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;

                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600'
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
