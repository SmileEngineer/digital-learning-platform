'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/Button';

export type UniversityShowcaseSection<T> = {
  id: string;
  title: string;
  href: string;
  items: T[];
};

export function UniversityShowcase<T>({
  sections,
  renderItem,
}: {
  sections: UniversityShowcaseSection<T>[];
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <div className="space-y-12">
      {sections.map((section) => (
        <section key={section.id}>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">{section.title}</h2>
            <Link href={section.href}>
              <Button variant="outline">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {section.items.map((item) => renderItem(item))}
          </div>
        </section>
      ))}
    </div>
  );
}
