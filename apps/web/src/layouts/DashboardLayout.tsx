'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bell,
  BookOpen,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Lock,
  LogOut,
  Package,
  User,
  Video,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { path: '/dashboard/courses', icon: BookOpen, label: 'My Courses' },
  { path: '/dashboard/ebooks', icon: FileText, label: 'My eBooks' },
  { path: '/dashboard/live-classes', icon: Video, label: 'Live Classes' },
  { path: '/dashboard/practice-exams', icon: ClipboardList, label: 'Practice Exams' },
  { path: '/dashboard/orders', icon: Package, label: 'Book Orders' },
  { path: '/dashboard/profile', icon: User, label: 'Profile' },
  { path: '/dashboard/change-password', icon: Lock, label: 'Change Password' },
  { path: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
];

function initialsFromName(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U'
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <section className="mb-6 rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-3xl font-semibold">
                {initialsFromName(user?.name ?? '')}
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Welcome, {user?.name ?? 'Learner'}!
                </h1>
                <p className="mt-2 text-sm text-slate-300">{user?.email ?? ''}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push('/');
              }}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20 lg:self-auto"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="self-start rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
            <nav>
              <ul className="space-y-1.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                          isActive
                            ? 'bg-emerald-50 font-medium text-emerald-800'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <main className="min-w-0 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
