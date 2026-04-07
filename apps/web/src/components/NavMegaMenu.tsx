'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import {
  SEMESTER_ROMAN,
  getStates,
  labelForState,
  labelForUniversity,
  catalogBrowseUrl,
  getUniversities,
  supportsSemesters,
  type SemesterIndex,
} from '@/lib/navCatalog';

type Base = '/courses' | '/ebooks';

const panelClass =
  'absolute left-0 top-full z-50 pt-2 opacity-0 invisible translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0';

export function NavMegaMenuTrigger({
  base,
  label,
}: {
  base: Base;
  label: string;
}) {
  const states = getStates(base);
  const [stateId, setStateId] = useState(states[0]?.id ?? '');
  const universities = getUniversities(stateId, base);
  const [universityId, setUniversityId] = useState(() => universities[0]?.id ?? '');

  useEffect(() => {
    const next = getUniversities(stateId, base);
    setUniversityId(next[0]?.id ?? '');
  }, [base, stateId]);

  const activeUniversityId = universityId || universities[0]?.id || '';
  const showSemesters = activeUniversityId ? supportsSemesters(stateId, activeUniversityId, base) : false;
  const pathname = usePathname();
  const sectionActive = pathname === base || pathname.startsWith(`${base}/`);

  return (
    <div className="group relative">
      <Link
        href={base}
        className={`nav-kantri-link inline-flex items-center gap-1 rounded-md px-1 py-2 text-[0.9375rem] font-medium transition-colors hover:text-indigo-600 ${
          sectionActive ? 'text-indigo-700' : 'text-slate-700'
        }`}
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70 transition-transform duration-200 group-hover:rotate-180" />
      </Link>

      <div className={panelClass}>
        <div
          className="min-w-[min(92vw,44rem)] rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 grid grid-cols-3 gap-2 border-b border-slate-100 pb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Main Menu</span>
            <span>Sub Menu</span>
            <span>{showSemesters ? 'Sub-sub Menu' : 'Browse'}</span>
          </div>

          <div className="grid max-h-[min(70vh,22rem)] grid-cols-3 gap-4">
            <ul className="space-y-0.5 overflow-y-auto pr-1 text-sm">
              {states.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`${base}?state=${encodeURIComponent(s.id)}`}
                    onMouseEnter={() => setStateId(s.id)}
                    onFocus={() => setStateId(s.id)}
                    className={`flex w-full rounded-lg px-3 py-2 text-left transition-colors ${
                      stateId === s.id
                        ? 'bg-indigo-50 font-semibold text-indigo-900'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>

            <ul className="space-y-0.5 overflow-y-auto border-l border-slate-100 pl-4 text-sm">
              {universities.map((u) => (
                <li key={u.id}>
                  <Link
                    href={`${base}?state=${encodeURIComponent(stateId)}&university=${encodeURIComponent(u.id)}`}
                    onClick={() => setUniversityId(u.id)}
                    className={`flex w-full rounded-lg px-3 py-2 text-left transition-colors ${
                      activeUniversityId === u.id
                        ? 'bg-indigo-50 font-semibold text-indigo-950'
                        : 'text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {u.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="border-l border-slate-100 pl-4">
              {showSemesters ? (
                <>
                  <p className="mb-2 text-xs font-medium text-slate-500">Sem - I to Sem - VI</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {([1, 2, 3, 4, 5, 6] as const).map((sem) => (
                      <Link
                        key={sem}
                        href={
                          activeUniversityId
                            ? catalogBrowseUrl(
                                base,
                                stateId,
                                activeUniversityId,
                                sem as SemesterIndex
                              )
                            : base
                        }
                        className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50/80 px-2 py-2.5 text-center text-sm font-semibold text-slate-800 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-950"
                      >
                        {SEMESTER_ROMAN[sem - 1]}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
                  <p className="font-medium text-slate-900">No semester split</p>
                  <p className="mt-2">
                    This category stops at the sub-category level. Click the selected item to browse all matching {label.toLowerCase()}.
                  </p>
                </div>
              )}
              <p className="mt-3 text-[0.7rem] leading-snug text-slate-500">
                Browse {label.toLowerCase()} by main menu, sub menu, and semester where available. You can also click{' '}
                {labelForState(stateId, base)}
                {activeUniversityId ? `, ${labelForUniversity(stateId, activeUniversityId, base)}` : ''}
                {showSemesters ? ', or any semester directly.' : ' directly.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
