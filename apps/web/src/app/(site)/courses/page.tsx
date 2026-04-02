import { Suspense } from 'react';
import { CoursesCatalogPage } from '@/views/courses/CoursesCatalogPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CoursesCatalogPage />
    </Suspense>
  );
}
