/** Browse-by catalog: main menu -> sub-menu -> optional semester, aligned with the supplied workbook. */

import {
  DEFAULT_MODULE_CATEGORIES,
  DEFAULT_SITE_NAVIGATION,
  type SiteModuleCategoryConfig,
  type SiteNavigationConfig,
  type SiteNavigationState,
  type SiteNavigationUniversity,
} from '@/lib/site-config-defaults';

export const SEMESTER_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'] as const;
export type SemesterIndex = 1 | 2 | 3 | 4 | 5 | 6;
export type CatalogBase = '/courses' | '/ebooks';

export type StateItem = { id: string; name: string };
export type UniversityItem = SiteNavigationUniversity;
type CatalogStateItem = SiteNavigationState;

let navigationConfigOverride: SiteNavigationConfig | null = null;
let moduleCategoriesOverride: SiteModuleCategoryConfig | null = null;

function getCatalogByBase(): Record<CatalogBase, CatalogStateItem[]> {
  const navigation = navigationConfigOverride ?? DEFAULT_SITE_NAVIGATION;
  return {
    '/courses': navigation.courses,
    '/ebooks': navigation.ebooks,
  };
}

export function setNavigationConfigOverride(config: SiteNavigationConfig | null) {
  navigationConfigOverride = config;
}

export function setModuleCategoriesOverride(config: SiteModuleCategoryConfig | null) {
  moduleCategoriesOverride = config;
}

export function getModuleCategories(): SiteModuleCategoryConfig {
  return moduleCategoriesOverride ?? DEFAULT_MODULE_CATEGORIES;
}

export const STATES = DEFAULT_SITE_NAVIGATION.courses.map(({ id, name }) => ({ id, name }));

export function getStates(base: CatalogBase = '/courses'): StateItem[] {
  return getCatalogByBase()[base].map(({ id, name }) => ({ id, name }));
}

export function getUniversities(stateId: string, base: CatalogBase = '/courses'): UniversityItem[] {
  return getCatalogByBase()[base].find((item) => item.id === stateId)?.universities ?? [];
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
