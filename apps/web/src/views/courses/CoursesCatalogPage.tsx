'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/Button';
import { CatalogFilterBanner } from '@/components/CatalogFilterBanner';
import { CourseCard } from '@/components/CourseCard';
import { fetchCourses, type CourseSummary } from '@/lib/course-api';

type SortKey = 'popular' | 'newest' | 'price-asc' | 'price-desc' | 'rating';

export function CoursesCatalogPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('popular');

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

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(courses.map((course) => course.category)))],
    [courses]
  );

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = courses.filter((course) => {
      const matchesCategory =
        selectedCategory === 'All' || course.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesQuery =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.shortDescription.toLowerCase().includes(query) ||
        course.instructorName.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
        default:
          return b.studentsCount - a.studentsCount;
      }
    });
  }, [courses, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <CatalogFilterBanner />

        <div className="mb-8">
          <h1 className="text-4xl mb-3">All Courses</h1>
          <p className="text-slate-600 text-lg">
            Browse expert-led digital courses with preview lessons and controlled access.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
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
            <div className="flex items-center gap-3">
              <Button variant="outline" type="button">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
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
                students={course.studentsCount}
                rating={course.rating}
                tags={course.tag ? [course.tag] : []}
                instructor={course.instructorName}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
