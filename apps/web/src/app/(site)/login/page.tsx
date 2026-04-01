import { Suspense } from 'react';
import { LoginPage } from '@/views/LoginPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LoginPage />
    </Suspense>
  );
}
