'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/Button';
import { CatalogFilterBanner } from '@/components/CatalogFilterBanner';
import { CourseCard } from '@/components/CourseCard';
import { fetchCourses, type CourseSummary } from '@/lib/course-api';
import {
  buildBrowseHref,
  createBrowseSelection,
  getSemesterOptions,
  getUniversityOptions,
  matchesBrowseSelection,
} from '@/lib/catalog-browse';

export function CoursesCatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const selection = useMemo(
    () =>
      createBrowseSelection(
        searchParams.get('state'),
        searchParams.get('university'),
        searchParams.get('semester')
      ),
    [searchParams]
  );

  const universityOptions = useMemo(() => getUniversityOptions(selection.state), [selection.state]);
  const semesterOptions = useMemo(() => getSemesterOptions(), []);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesBrowse = matchesBrowseSelection(course, selection);
      const matchesQuery =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.shortDescription.toLowerCase().includes(query) ||
        course.instructorName.toLowerCase().includes(query) ||
        (course.stateName ?? '').toLowerCase().includes(query) ||
        (course.universityName ?? '').toLowerCase().includes(query) ||
        (course.semesterLabel ?? '').toLowerCase().includes(query);
      return matchesBrowse && matchesQuery;
    });
  }, [courses, searchQuery, selection]);

  function updateSelection(next: Partial<typeof selection>) {
    router.push(
      buildBrowseHref('/courses', {
        ...selection,
        ...next,
      })
    );
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
              <select
                value={selection.university}
                onChange={(e) => updateSelection({ university: e.target.value, semester: '' })}
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
              <select
                value={selection.semester}
                onChange={(e) => updateSelection({ semester: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">All Semesters</option>
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
              onClick={() => router.push('/courses')}
              className="whitespace-nowrap"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-slate-600">
            {loading ? 'Loading courses…' : `${filteredCourses.length} courses found`}
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
