'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Award, BookOpen, BookText, FileText, Video } from 'lucide-react';
import { CourseCard } from '@/components/CourseCard';
import { UniversityShowcase, type UniversityShowcaseSection } from '@/components/UniversityShowcase';
import { fetchCourses, type CourseSummary } from '@/lib/course-api';
import { fetchCatalogItems } from '@/lib/platform-api';
import { buildBrowseHref, findBrowseSelection, getAllUniversities } from '@/lib/catalog-browse';

const categories = [
  {
    href: '/courses',
    title: 'Digital Courses',
    description: 'Learn anytime, anywhere with my comprehensive video courses',
    icon: BookOpen,
    className: 'from-blue-500 to-blue-600',
    textClassName: 'text-blue-100',
  },
  {
    href: '/ebooks',
    title: 'eBooks',
    description: 'Access my extensive digital library of eBooks',
    icon: FileText,
    className: 'from-purple-500 to-purple-600',
    textClassName: 'text-purple-100',
  },
  {
    href: '/books',
    title: 'Physical Books',
    description: 'Access the Physical Books',
    icon: BookText,
    className: 'from-amber-500 to-orange-600',
    textClassName: 'text-amber-100',
  },
  {
    href: '/live-classes',
    title: 'Live Classes',
    description: 'Join real-time interactive Live Classes',
    icon: Video,
    className: 'from-green-500 to-green-600',
    textClassName: 'text-green-100',
  },
  {
    href: '/practice-exams',
    title: 'Practice Exams',
    description: 'Write Practice Exams and test your knowledge',
    icon: Award,
    className: 'from-rose-500 to-red-600',
    textClassName: 'text-rose-100',
  },
] as const;

export function HomePage() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);

  useEffect(() => {
    let cancelled = false;

    void fetchCatalogItems('ebook').catch(() => undefined);

    fetchCourses()
      .then((items) => {
        if (!cancelled) {
          setCourses(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCourses([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const universitySections = useMemo(() => {
    const sortedCourses = [...courses].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return getAllUniversities('/courses')
      .map((university): UniversityShowcaseSection<CourseSummary> | null => {
        const items = sortedCourses
          .filter(
            (course) =>
              course.stateName?.toLowerCase() === university.stateName.toLowerCase() &&
              course.universityName?.toLowerCase() === university.universityName.toLowerCase()
          )
          .slice(0, 4);

        if (items.length === 0) return null;

        const selection = findBrowseSelection('/courses', university.stateName, university.universityName);
        return {
          id: `${university.stateId}-${university.universityId}`,
          title: university.universityName,
          href: selection ? buildBrowseHref('/courses', selection) : '/courses',
          items,
        };
      })
      .filter((section): section is UniversityShowcaseSection<CourseSummary> => section !== null);
  }, [courses]);

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 py-10 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl py-4 text-center">
            <p className="text-xl font-semibold text-indigo-100 sm:text-2xl">
              Kantri by Awareness, Honest by Conscience.
            </p>
            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
              An anonymous voice on a mission to simplify the law for the common people.
            </h1>
            <p className="mx-auto mt-3 max-w-3xl text-base text-indigo-100 sm:text-lg">
              A sincere desire to build responsible citizens with strong values is my credential.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="mb-3 text-3xl font-bold text-slate-900">Explore by Category</h2>
            <p className="text-slate-600">
              Browse legal learning materials by format and choose the path that fits you best.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:auto-rows-fr md:grid-cols-2 xl:grid-cols-5">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.href} href={category.href} className="group block h-full">
                  <div
                    className={`flex h-full flex-col rounded-2xl bg-gradient-to-br ${category.className} p-8 text-white transition-shadow hover:shadow-lg`}
                  >
                    <Icon className="mb-4 h-12 w-12" />
                    <h3 className="mb-2 text-xl">{category.title}</h3>
                    <p className={`mb-4 flex-1 text-sm ${category.textClassName}`}>{category.description}</p>
                    <span className="mt-auto flex items-center gap-2 text-sm transition-all group-hover:gap-3">
                      Explore <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {universitySections.length > 0 && (
        <section className="bg-slate-50 py-16">
          <div className="container mx-auto px-4">
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
          </div>
        </section>
      )}
    </div>
  );
}
