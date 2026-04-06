import { Suspense } from 'react';
import { ResetPasswordPage } from '@/views/ResetPasswordPage';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Loading…</div>
      }
    >
      <ResetPasswordPage />
    </Suspense>
  );
}
