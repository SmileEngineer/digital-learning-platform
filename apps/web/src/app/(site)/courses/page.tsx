import { Suspense } from 'react';
import { CoursesPage } from '@/views/CoursesPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CoursesPage />
    </Suspense>
  );
}
