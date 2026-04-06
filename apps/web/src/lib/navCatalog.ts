/** Browse-by catalog: State → University → Semester (I–VI), aligned with Kantri Lawyer–style navigation. */

export const SEMESTER_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'] as const;
export type SemesterIndex = 1 | 2 | 3 | 4 | 5 | 6;
export type CatalogBase = '/courses' | '/ebooks';

export type StateItem = { id: string; name: string };
export type UniversityItem = { id: string; name: string; semesters?: boolean };
type CatalogStateItem = StateItem & { universities: UniversityItem[] };

const COURSE_CATEGORIES: CatalogStateItem[] = [
  {
    id: 'telangana',
    name: 'Telangana',
    universities: [
      { id: 'kakatiya-university', name: 'Kakatiya University', semesters: true },
      { id: 'osmania-university', name: 'Osmania University', semesters: true },
      { id: 'palamuru-university', name: 'Palamuru University', semesters: true },
      { id: 'satavahana-university', name: 'Satavahana University', semesters: true },
      { id: 'telangana-university', name: 'Telangana University', semesters: true },
      { id: 'mahatma-gandhi-university', name: 'Mahatma Gandhi University', semesters: true },
    ],
  },
  {
    id: 'andhra-pradesh',
    name: 'Andhra Pradesh',
    universities: [
      { id: 'acharya-nagarjuna-university', name: 'Acharya Nagarjuna University', semesters: true },
      { id: 'adikavi-nannaya-university', name: 'Adikavi Nannaya University', semesters: true },
      { id: 'ambedkar-university', name: 'Ambedkar University', semesters: true },
      { id: 'andhra-kesari-university', name: 'Andhra Kesari University', semesters: true },
      { id: 'andhra-university', name: 'Andhra University', semesters: true },
      {
        id: 'damodaram-sanjivayya-national-law-university',
        name: 'Damodaram Sanjivayya National Law University',
        semesters: true,
      },
      { id: 'kl-university', name: 'KL University', semesters: true },
      { id: 'krishna-university', name: 'Krishna University', semesters: true },
      { id: 'rayalaseema-university', name: 'Rayalaseema University', semesters: true },
      { id: 'sri-krishnadevaraya-university', name: 'Sri Krishnadevaraya University', semesters: true },
      {
        id: 'sri-padmavati-mahila-visva-vidyalayam',
        name: 'Sri Padmavati Mahila Visva Vidyalayam',
        semesters: true,
      },
      { id: 'sri-venkateswara-university', name: 'Sri Venkateswara University', semesters: true },
      { id: 'vikrama-simhapuri-university', name: 'Vikrama Simhapuri University', semesters: true },
      { id: 'yogi-vemana-university', name: 'Yogi Vemana University', semesters: true },
    ],
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    universities: [{ id: 'karnataka-state-law-university', name: 'Karnataka State Law University', semesters: true }],
  },
  {
    id: 'lawcet',
    name: 'LAWCET',
    universities: [
      { id: 'ts-lawcet', name: 'TS LAWCET', semesters: false },
      { id: 'ap-lawcet', name: 'AP LAWCET', semesters: false },
    ],
  },
  {
    id: 'clat',
    name: 'CLAT',
    universities: [
      { id: 'clat-in-telugu', name: 'CLAT in Telugu', semesters: false },
      { id: 'clat-in-english', name: 'CLAT in English', semesters: false },
    ],
  },
  {
    id: 'aibe',
    name: 'AIBE',
    universities: [
      { id: 'aibe-in-telugu', name: 'AIBE in Telugu', semesters: false },
      { id: 'aibe-in-english', name: 'AIBE in English', semesters: false },
    ],
  },
  {
    id: 'bare-acts',
    name: 'Bare Acts',
    universities: [
      { id: 'bare-acts-in-telugu', name: 'Bare Acts in Telugu', semesters: false },
      { id: 'bare-acts-in-english', name: 'Bare Acts in English', semesters: false },
    ],
  },
];

const EBOOK_CATEGORIES: CatalogStateItem[] = COURSE_CATEGORIES.filter(
  (item) => !['clat', 'aibe', 'bare-acts'].includes(item.id)
);

const CATALOG_BY_BASE: Record<CatalogBase, CatalogStateItem[]> = {
  '/courses': COURSE_CATEGORIES,
  '/ebooks': EBOOK_CATEGORIES,
};

export const STATES = COURSE_CATEGORIES.map(({ id, name }) => ({ id, name }));

export function getStates(base: CatalogBase = '/courses'): StateItem[] {
  return CATALOG_BY_BASE[base].map(({ id, name }) => ({ id, name }));
}

export function getUniversities(stateId: string, base: CatalogBase = '/courses'): UniversityItem[] {
  return CATALOG_BY_BASE[base].find((item) => item.id === stateId)?.universities ?? [];
}

export function supportsSemesters(
  stateId: string,
  universityId: string,
  base: CatalogBase = '/courses'
): boolean {
  return getUniversities(stateId, base).find((item) => item.id === universityId)?.semesters !== false;
}

export function catalogBrowseUrl(
  base: CatalogBase,
  stateId: string,
  universityId: string,
  semester?: SemesterIndex
) {
  const params = new URLSearchParams({
    state: stateId,
    university: universityId,
  });
  if (semester) {
    params.set('semester', String(semester));
  }
  return `${base}?${params.toString()}`;
}

export function labelForState(id: string, base: CatalogBase = '/courses'): string {
  return getStates(base).find((s) => s.id === id)?.name ?? id;
}

export function labelForUniversity(
  stateId: string,
  universityId: string,
  base: CatalogBase = '/courses'
): string {
  return getUniversities(stateId, base).find((u) => u.id === universityId)?.name ?? universityId;
}
