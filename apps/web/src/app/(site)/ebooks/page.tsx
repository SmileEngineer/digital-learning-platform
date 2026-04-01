import { Suspense } from 'react';
import { EbooksPage } from '@/views/EbooksPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <EbooksPage />
    </Suspense>
  );
}
