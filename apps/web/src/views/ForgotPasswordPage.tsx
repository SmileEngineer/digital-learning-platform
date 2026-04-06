'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '../components/Button';
import { ArrowLeft } from 'lucide-react';
import { requestPasswordReset } from '@/lib/platform-api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      await requestPasswordReset(email.trim().toLowerCase());
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
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
          <h1 className="mb-2 text-3xl">Reset Password</h1>
          <p className="text-slate-600">Enter your email to receive a reset link</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-8">
          {done ? (
            <div className="space-y-4 text-center text-slate-700">
              <p>If an account exists for that email, we sent a reset link. Check your inbox and spam folder.</p>
              <Link href="/login" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div>
                <label className="mb-2 block text-sm">Email Address</label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <Button type="submit" fullWidth size="lg" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send Reset Link'}
              </Button>
            </form>
          )}

          {!done && (
            <div className="mt-6 text-center">
              <Link href="/login" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
