import { SEMESTER_ROMAN, STATES, UNIVERSITIES_BY_STATE } from '@/lib/navCatalog';

export type BrowseBase = '/courses' | '/ebooks';

export type BrowseSelection = {
  state: string;
  university: string;
  semester: string;
};

export type BrowseMetadata = {
  stateName?: string | null;
  universityName?: string | null;
  semesterLabel?: string | null;
};

export function createBrowseSelection(
  state: string | null | undefined,
  university: string | null | undefined,
  semester: string | null | undefined
): BrowseSelection {
  return {
    state: state?.trim() ?? '',
    university: university?.trim() ?? '',
    semester: semester?.trim() ?? '',
  };
}

export function buildBrowseHref(base: BrowseBase, selection: BrowseSelection): string {
  const params = new URLSearchParams();
  if (selection.state) params.set('state', selection.state);
  if (selection.university) params.set('university', selection.university);
  if (selection.semester) params.set('semester', selection.semester);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function getUniversityOptions(stateId: string) {
  if (!stateId) {
    return Object.entries(UNIVERSITIES_BY_STATE).flatMap(([, items]) => items);
  }
  return UNIVERSITIES_BY_STATE[stateId] ?? [];
}

export function getSemesterOptions() {
  return SEMESTER_ROMAN.map((label, index) => ({
    value: String(index + 1),
    label: `Semester ${label}`,
  }));
}

export function getStateOptionLabel(stateId: string): string {
  return STATES.find((entry) => entry.id === stateId)?.name ?? stateId;
}

export function getUniversityOptionLabel(stateId: string, universityId: string): string {
  return getUniversityOptions(stateId).find((entry) => entry.id === universityId)?.name ?? universityId;
}

export function normalizeSemesterLabel(label?: string | null): string {
  const raw = (label ?? '').trim();
  if (!raw) return '';
  const compact = raw.replace(/^semester\s+/i, '').trim().toUpperCase();
  const romanIndex = SEMESTER_ROMAN.findIndex((entry) => entry === compact);
  if (romanIndex >= 0) return String(romanIndex + 1);
  const numeric = Number.parseInt(compact, 10);
  return Number.isFinite(numeric) ? String(numeric) : compact;
}

function normalizeName(value?: string | null): string {
  return (value ?? '').trim().toLowerCase();
}

export function matchesBrowseSelection(item: BrowseMetadata, selection: BrowseSelection): boolean {
  if (selection.state) {
    const stateLabel = getStateOptionLabel(selection.state).toLowerCase();
    if (normalizeName(item.stateName) !== stateLabel) return false;
  }

  if (selection.university) {
    const universityLabel = getUniversityOptionLabel(selection.state, selection.university).toLowerCase();
    if (normalizeName(item.universityName) !== universityLabel) return false;
  }

  if (selection.semester) {
    if (normalizeSemesterLabel(item.semesterLabel) !== normalizeSemesterLabel(selection.semester)) return false;
  }

  return true;
}
