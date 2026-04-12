import { SEMESTER_ROMAN, getStates, getUniversities, labelForState, labelForUniversity, type CatalogBase } from '@/lib/navCatalog';

export type BrowseBase = CatalogBase;

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

export type UniversityBrowseItem = {
  stateId: string;
  stateName: string;
  universityId: string;
  universityName: string;
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
    return getStates('/courses').flatMap((item) => getUniversities(item.id, '/courses'));
  }
  return getUniversities(stateId, '/courses');
}

export function getUniversityOptionsForBase(stateId: string, base: BrowseBase) {
  if (!stateId) {
    return getStates(base).flatMap((item) => getUniversities(item.id, base));
  }
  return getUniversities(stateId, base);
}

export function getAllUniversities(base: BrowseBase = '/courses'): UniversityBrowseItem[] {
  return getStates(base).flatMap((state) =>
    getUniversities(state.id, base).map((university) => ({
      stateId: state.id,
      stateName: state.name,
      universityId: university.id,
      universityName: university.name,
    }))
  );
}

export function getSemesterOptions() {
  return SEMESTER_ROMAN.map((label, index) => ({
    value: String(index + 1),
    label: `Semester ${label}`,
  }));
}

export function getStateOptionLabel(stateId: string, base: BrowseBase = '/courses'): string {
  return labelForState(stateId, base);
}

export function getUniversityOptionLabel(
  stateId: string,
  universityId: string,
  base: BrowseBase = '/courses'
): string {
  return labelForUniversity(stateId, universityId, base);
}

export function findBrowseSelection(
  base: BrowseBase,
  stateName?: string | null,
  universityName?: string | null
): BrowseSelection | null {
  const normalizedState = normalizeName(stateName);
  const normalizedUniversity = normalizeName(universityName);
  const match = getAllUniversities(base).find(
    (entry) =>
      (!normalizedState || normalizeName(entry.stateName) === normalizedState) &&
      normalizeName(entry.universityName) === normalizedUniversity
  );

  if (!match) return null;

  return {
    state: match.stateId,
    university: match.universityId,
    semester: '',
  };
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
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesBrowseSelection(
  item: BrowseMetadata,
  selection: BrowseSelection,
  base: BrowseBase = '/courses'
): boolean {
  if (selection.state) {
    const stateLabel = normalizeName(labelForState(selection.state, base));
    if (normalizeName(item.stateName) !== stateLabel) return false;
  }

  if (selection.university) {
    const universityLabel = normalizeName(labelForUniversity(selection.state, selection.university, base));
    if (normalizeName(item.universityName) !== universityLabel) return false;
  }

  if (selection.semester) {
    if (normalizeSemesterLabel(item.semesterLabel) !== normalizeSemesterLabel(selection.semester)) return false;
  }

  return true;
}
