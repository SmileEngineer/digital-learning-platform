'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  SEMESTER_ROMAN,
  catalogBrowseUrl,
  getStates,
  getUniversities,
  supportsSemesters,
  type SemesterIndex,
} from '@/lib/navCatalog';

function CatalogSection({
  title,
  base,
}: {
  title: string;
  base: '/courses' | '/ebooks';
}) {
  const states = getStates(base);
  const [stateId, setStateId] = useState(states[0]?.id ?? '');
  const universities = getUniversities(stateId, base);
  const [universityId, setUniversityId] = useState('');

  useEffect(() => {
    setUniversityId('');
  }, [base, stateId]);

  const uni = universityId;
  const showSemesters = uni ? supportsSemesters(stateId, uni, base) : false;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className="mb-2 text-[0.7rem] font-medium text-slate-500">Main Menu</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {states.map((s) => (
          <Link
            key={s.id}
            href={`${base}?state=${encodeURIComponent(s.id)}`}
            onClick={() => setStateId(s.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              stateId === s.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-200'
            }`}
          >
            {s.name}
          </Link>
        ))}
      </div>
      <p className="mb-2 text-[0.7rem] font-medium text-slate-500">Sub Menu</p>
      <div className="mb-3 flex flex-col gap-1">
        {universities.map((u) => (
          <Link
            key={u.id}
            href={`${base}?state=${encodeURIComponent(stateId)}&university=${encodeURIComponent(u.id)}`}
            onClick={() => setUniversityId(u.id)}
            className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              uni === u.id ? 'bg-indigo-50 font-semibold text-indigo-950' : 'text-slate-800'
            }`}
          >
            {u.name}
          </Link>
        ))}
      </div>
      {showSemesters ? (
        <>
          <p className="mb-2 text-[0.7rem] font-medium text-slate-500">Sem - I to Sem - VI</p>
          <div className="grid grid-cols-3 gap-2">
            {([1, 2, 3, 4, 5, 6] as const).map((sem) => (
              <Link
                key={sem}
                href={uni ? catalogBrowseUrl(base, stateId, uni, sem as SemesterIndex) : base}
                className="flex items-center justify-center rounded-lg border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-800 hover:border-indigo-300 hover:bg-indigo-50"
              >
                {SEMESTER_ROMAN[sem - 1]}
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
          This category does not use semesters. Choose a sub-category to continue.
        </div>
      )}
    </div>
  );
}

export function MobileCatalogDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(100vw,22rem)] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-2 text-[0.9375rem] font-medium">
          <Link
            href="/courses"
            className="rounded-lg px-3 py-2 text-slate-800 hover:bg-slate-100"
            onClick={() => setOpen(false)}
          >
            Courses
          </Link>
          <Link
            href="/ebooks"
            className="rounded-lg px-3 py-2 text-slate-800 hover:bg-slate-100"
            onClick={() => setOpen(false)}
          >
            eBooks
          </Link>
          <Link
            href="/books"
            className="rounded-lg px-3 py-2 text-slate-800 hover:bg-slate-100"
            onClick={() => setOpen(false)}
          >
            Physical Books
          </Link>
          <Link
            href="/live-classes"
            className="rounded-lg px-3 py-2 text-slate-800 hover:bg-slate-100"
            onClick={() => setOpen(false)}
          >
            Live Classes
          </Link>
          <Link
            href="/practice-exams"
            className="rounded-lg px-3 py-2 text-slate-800 hover:bg-slate-100"
            onClick={() => setOpen(false)}
          >
            Practice Exams
          </Link>
          <Link
            href="/articles"
            className="rounded-lg px-3 py-2 text-slate-800 hover:bg-slate-100"
            onClick={() => setOpen(false)}
          >
            Articles
          </Link>
          <Link
            href="/contact"
            className="rounded-lg px-3 py-2 text-slate-800 hover:bg-slate-100"
            onClick={() => setOpen(false)}
          >
            Contact
          </Link>
        </nav>

        <div className="mt-6 space-y-4 border-t border-slate-200 pt-6">
          <CatalogSection title="Courses - Main Menu / Sub Menu / Semester" base="/courses" />
          <CatalogSection title="eBooks - Main Menu / Sub Menu / Semester" base="/ebooks" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
