'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/Button';
import { CatalogFilterBanner } from '@/components/CatalogFilterBanner';
import { CourseCard } from '@/components/CourseCard';
import { UniversityShowcase, type UniversityShowcaseSection } from '@/components/UniversityShowcase';
import { fetchCourses, type CourseSummary } from '@/lib/course-api';
import {
  buildBrowseHref,
  createBrowseSelection,
  getUniversityOptionsForBase,
  findBrowseSelection,
  getAllUniversities,
  getSemesterOptions,
  matchesBrowseSelection,
} from '@/lib/catalog-browse';
import { supportsSemesters } from '@/lib/navCatalog';

export function CoursesCatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeSearch = searchParams.get('search') ?? '';
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(routeSearch);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchCourses();
        if (!cancelled) {
          setCourses(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load courses.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSearchQuery(routeSearch);
  }, [routeSearch]);

  const selection = useMemo(
    () =>
      createBrowseSelection(
        searchParams.get('state'),
        searchParams.get('university'),
        searchParams.get('semester')
      ),
    [searchParams]
  );

  const universityOptions = useMemo(
    () => getUniversityOptionsForBase(selection.state, '/courses'),
    [selection.state]
  );
  const semesterOptions = useMemo(() => getSemesterOptions(), []);
  const semesterFilterEnabled =
    !selection.state ||
    !selection.university ||
    supportsSemesters(selection.state, selection.university, '/courses');

  useEffect(() => {
    if (!semesterFilterEnabled && selection.semester) {
      router.replace(
        buildBrowseHref('/courses', {
          ...selection,
          semester: '',
        }),
        { scroll: false }
      );
    }
  }, [router, selection, semesterFilterEnabled]);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return courses
      .filter((course) => {
        const matchesBrowse = matchesBrowseSelection(course, selection, '/courses');
        const matchesQuery =
          !query ||
          course.title.toLowerCase().includes(query) ||
          course.shortDescription.toLowerCase().includes(query) ||
          course.instructorName.toLowerCase().includes(query) ||
          (course.stateName ?? '').toLowerCase().includes(query) ||
          (course.universityName ?? '').toLowerCase().includes(query) ||
          (course.semesterLabel ?? '').toLowerCase().includes(query);
        return matchesBrowse && matchesQuery;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [courses, searchQuery, selection]);

  const showUniversitySections =
    !loading &&
    !searchQuery.trim() &&
    !selection.university &&
    !selection.semester;

  const universitySections = useMemo(() => {
    const sortedCourses = [...courses].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return getAllUniversities('/courses')
      .filter((university) => !selection.state || university.stateId === selection.state)
      .map((university): UniversityShowcaseSection<CourseSummary> | null => {
        const items = sortedCourses
          .filter(
            (course) =>
              course.stateName?.toLowerCase() === university.stateName.toLowerCase() &&
              course.universityName?.toLowerCase() === university.universityName.toLowerCase()
          )
          .slice(0, 4);

        if (items.length === 0) return null;

        const browseSelection = findBrowseSelection('/courses', university.stateName, university.universityName);
        return {
          id: `${university.stateId}-${university.universityId}`,
          title: university.universityName,
          href: browseSelection ? buildBrowseHref('/courses', browseSelection) : '/courses',
          items,
        };
      })
      .filter((section): section is UniversityShowcaseSection<CourseSummary> => section !== null);
  }, [courses, selection.state]);

  function updateSelection(next: Partial<typeof selection>) {
    router.push(
      buildBrowseHref('/courses', {
        ...selection,
        ...next,
      })
    );
  }

  function updateUniversity(universityId: string) {
    if (!universityId) {
      updateSelection({ university: '', semester: '' });
      return;
    }

    const universityMatch = getAllUniversities('/courses').find(
      (entry) =>
        entry.universityId === universityId && (!selection.state || entry.stateId === selection.state)
    );
    updateSelection({
      state: universityMatch?.stateId ?? selection.state,
      university: universityId,
      semester: '',
    });
  }

  function handleReset() {
    setSearchQuery('');
    router.push('/courses');
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <CatalogFilterBanner />

        <div className="mb-8">
          <h1 className="text-4xl mb-3">All Courses</h1>
          <p className="text-slate-600 text-lg">
            Browse law-focused digital courses by state, university, and semester.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-8">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Select University
              </label>
              <select
                value={selection.university}
                onChange={(e) => updateUniversity(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">All Universities</option>
                {universityOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Choose Semester
              </label>
              <select
                value={selection.semester}
                onChange={(e) => updateSelection({ semester: e.target.value })}
                disabled={!semesterFilterEnabled}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">{semesterFilterEnabled ? 'All Semesters' : 'No semester split'}</option>
                {semesterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="outline"
              type="button"
              onClick={handleReset}
              className="self-end whitespace-nowrap"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-slate-600">
            {loading ? 'Preparing course list...' : `${filteredCourses.length} courses found`}
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[22rem] rounded-lg border border-slate-200 bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-600">
            No courses matched your current search and filter settings.
          </div>
        ) : showUniversitySections && universitySections.length > 0 ? (
          <UniversityShowcase
            sections={universitySections}
            renderItem={(course) => (
              <CourseCard
                key={course.id}
                id={course.slug}
                title={course.title}
                description={course.shortDescription}
                image={course.imageUrl}
                price={course.price}
                duration={course.durationText}
                tags={course.tag ? [course.tag] : []}
                instructor={course.instructorName}
                stateName={course.stateName}
                universityName={course.universityName}
                semesterLabel={course.semesterLabel}
              />
            )}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.slug}
                title={course.title}
                description={course.shortDescription}
                image={course.imageUrl}
                price={course.price}
                duration={course.durationText}
                tags={course.tag ? [course.tag] : []}
                instructor={course.instructorName}
                stateName={course.stateName}
                universityName={course.universityName}
                semesterLabel={course.semesterLabel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
