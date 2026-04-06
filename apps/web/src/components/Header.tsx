'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NavMegaMenuTrigger } from './NavMegaMenu';
import { MobileCatalogDrawer } from './MobileCatalogDrawer';

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`nav-kantri-link rounded-md px-1 py-2 text-[0.9375rem] font-medium transition-colors ${
        active ? 'text-indigo-700' : 'text-slate-700 hover:text-indigo-600'
      }`}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  const accountHref =
    user?.role === 'staff' || user?.role === 'admin' || user?.role === 'super_admin' ? '/admin' : '/dashboard';
  const notice = 'Site is under construction. No orders will be fulfilled at this time.';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="overflow-hidden border-b border-amber-200 bg-amber-100 text-amber-950">
        <div className="kantri-marquee">
          <div className="kantri-marquee-track py-2 text-sm font-medium">
            <span>{notice}</span>
            <span aria-hidden="true">{notice}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-[4.375rem] items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <MobileCatalogDrawer />
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <span className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full border-[1.5px] border-indigo-600 bg-white shadow-[0_4px_14px_rgba(37,99,235,0.22)]">
                <Image
                  src="/images/logo.svg"
                  alt="Kantri Lawyer"
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                  priority
                />
              </span>
              <div className="hidden min-w-0 flex-col leading-tight sm:flex">
                <span className="truncate text-[1.35rem] font-black tracking-tight text-slate-900 sm:text-[1.55rem]">
                  KANTRI <span className="text-indigo-600">LAWYER</span>
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            <NavLink href="/">Home</NavLink>
            <NavMegaMenuTrigger base="/courses" label="Courses" />
            <NavMegaMenuTrigger base="/ebooks" label="eBooks" />
            <NavLink href="/books">Physical Books</NavLink>
            <NavLink href="/live-classes">Live Classes</NavLink>
            <NavLink href="/practice-exams">Practice Exams</NavLink>
            <NavLink href="/articles">Articles</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {user && (
              <>
                <Link
                  href={accountHref}
                  className="hidden max-w-[10rem] truncate rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:inline-block"
                  title={user.name}
                >
                  {user.name.split(/\s+/)[0]}
                </Link>
              </>
            )}
            <Link
              href="/checkout"
              className="relative flex items-center rounded-lg p-2 text-slate-700 hover:bg-slate-100"
              aria-label="Cart"
            >
              <ShoppingCart className="h-[22px] w-[22px]" />
            </Link>
            {user ? (
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  window.location.assign('/');
                }}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
              >
                <LogOut className="h-[18px] w-[18px]" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-[10px] bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                <User className="h-[18px] w-[18px]" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
