/** Browse-by catalog: State → University → Semester (I–VI), aligned with Kantri Lawyer–style navigation. */

export const SEMESTER_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'] as const;
export type SemesterIndex = 1 | 2 | 3 | 4 | 5 | 6;

export type StateItem = { id: string; name: string };
export type UniversityItem = { id: string; name: string };

export const STATES: StateItem[] = [
  { id: 'telangana', name: 'Telangana' },
  { id: 'andhra-pradesh', name: 'Andhra Pradesh' },
  { id: 'karnataka', name: 'Karnataka' },
  { id: 'maharashtra', name: 'Maharashtra' },
  { id: 'tamil-nadu', name: 'Tamil Nadu' },
  { id: 'kerala', name: 'Kerala' },
];

export const UNIVERSITIES_BY_STATE: Record<string, UniversityItem[]> = {
  telangana: [
    { id: 'ou', name: 'Osmania University (OU)' },
    { id: 'ku', name: 'Kakatiya University' },
    { id: 'tu', name: 'Telangana University' },
  ],
  'andhra-pradesh': [
    { id: 'andhra-univ', name: 'Andhra University' },
    { id: 'svu', name: 'Sri Venkateswara University' },
  ],
  karnataka: [
    { id: 'bangalore-univ', name: 'Bangalore University' },
    { id: 'mysore', name: 'University of Mysore' },
  ],
  maharashtra: [
    { id: 'mumbai', name: 'University of Mumbai' },
    { id: 'pune', name: 'Savitribai Phule Pune University' },
  ],
  'tamil-nadu': [
    { id: 'madras', name: 'University of Madras' },
    { id: 'anna', name: 'Anna University' },
  ],
  kerala: [
    { id: 'calicut', name: 'University of Calicut' },
    { id: 'kerala', name: 'University of Kerala' },
  ],
};

export function getUniversities(stateId: string): UniversityItem[] {
  return UNIVERSITIES_BY_STATE[stateId] ?? [];
}

export function catalogBrowseUrl(
  base: '/courses' | '/ebooks',
  stateId: string,
  universityId: string,
  semester: SemesterIndex
) {
  const params = new URLSearchParams({
    state: stateId,
    university: universityId,
    semester: String(semester),
  });
  return `${base}?${params.toString()}`;
}

export function labelForState(id: string): string {
  return STATES.find((s) => s.id === id)?.name ?? id;
}

export function labelForUniversity(stateId: string, universityId: string): string {
  return getUniversities(stateId).find((u) => u.id === universityId)?.name ?? universityId;
}
