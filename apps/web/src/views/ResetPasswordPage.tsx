'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/Button';
import { resetPasswordWithToken } from '@/lib/platform-api';

export function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    try {
      setSubmitting(true);
      await resetPasswordWithToken({ token, password });
      router.push('/login?reset=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center bg-slate-50 py-12 px-4">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-2">
            <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-indigo-600">
              <Image src="/images/logo.png" alt="" width={40} height={40} className="object-cover" />
            </span>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              KANTRI <span className="text-indigo-600">LAWYER</span>
            </span>
          </Link>
          <h1 className="mb-2 text-3xl">Set a new password</h1>
          <p className="text-slate-600">Choose a strong password you have not used elsewhere.</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-8">
          {!token ? (
            <p className="text-center text-slate-600">
              This reset link is invalid.{' '}
              <Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-700">
                Request a new link
              </Link>
              .
            </p>
          ) : (
            <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div>
                <label className="mb-2 block text-sm">New password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm">Confirm password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" fullWidth size="lg" disabled={submitting}>
                {submitting ? 'Saving…' : 'Update password'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
