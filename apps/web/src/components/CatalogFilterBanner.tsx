'use client';

import { useSearchParams } from 'next/navigation';
import {
  labelForState,
  labelForUniversity,
  SEMESTER_ROMAN,
} from '@/lib/navCatalog';

export function CatalogFilterBanner() {
  const sp = useSearchParams();
  const state = sp.get('state');
  const university = sp.get('university');
  const semester = sp.get('semester');

  if (!state && !university && !semester) return null;

  const semNum = semester ? parseInt(semester, 10) : NaN;
  const semLabel =
    semNum >= 1 && semNum <= 6 ? `Semester ${SEMESTER_ROMAN[semNum - 1]}` : semester;

  return (
    <div
      className="mb-6 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50/90 px-4 py-3 text-sm text-slate-900 shadow-sm"
      role="status"
    >
      <span className="font-semibold text-indigo-900">Catalog: </span>
      {state && <span>{labelForState(state)}</span>}
      {state && university && <span className="text-indigo-600"> · </span>}
      {university && state && (
        <span>{labelForUniversity(state, university)}</span>
      )}
      {(state || university) && semester && (
        <span className="text-indigo-600"> · </span>
      )}
      {semester && <span>{semLabel}</span>}
    </div>
  );
}
