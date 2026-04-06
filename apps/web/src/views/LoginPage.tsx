'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nextPath = searchParams.get('next') || '/dashboard';

  useEffect(() => {
    if (user) {
      router.replace(nextPath.startsWith('/') ? nextPath : '/dashboard');
    }
  }, [user, router, nextPath]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.push(nextPath.startsWith('/') ? nextPath : '/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-2">
            <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-indigo-600">
              <Image
                src="/images/logo.png"
                alt=""
                width={40}
                height={40}
                className="object-cover"
              />
            </span>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              KANTRI <span className="text-indigo-600">LAWYER</span>
            </span>
          </Link>
          <h1 className="mb-2 text-3xl font-semibold text-slate-900">Welcome back</h1>
          <p className="text-slate-600">Sign in to your account to continue</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-8">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {error && (
              <div
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {error}
              </div>
            )}
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-700">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
