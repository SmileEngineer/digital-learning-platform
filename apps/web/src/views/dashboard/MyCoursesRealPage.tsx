'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, BookOpen, Clock, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { fetchMyCourses, type PurchasedCourse } from '@/lib/course-api';

type Filter = 'all' | 'in-progress' | 'completed';

function expiryLabel(course: PurchasedCourse): string {
  if (!course.accessExpiresAt) return 'Lifetime access';
  return `Access until ${new Date(course.accessExpiresAt).toLocaleDateString()}`;
}

export function MyCoursesRealPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<PurchasedCourse[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchMyCourses();
        if (!cancelled) {
          setCourses(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load your courses.');
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

  const filtered = useMemo(() => {
    if (filter === 'completed') {
      return courses.filter((course) => course.progressPercent >= 100);
    }
    if (filter === 'in-progress') {
      return courses.filter((course) => course.progressPercent > 0 && course.progressPercent < 100);
    }
    return courses;
  }, [courses, filter]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl mb-2">My Courses</h1>
        <p className="text-slate-600">Courses you&apos;ve unlocked are listed here with access validity.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button variant={filter === 'all' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('all')}>
          All Courses
        </Button>
        <Button
          variant={filter === 'in-progress' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('in-progress')}
        >
          In Progress
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 text-red-700">
          <p>{error}</p>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-40 rounded-lg border border-slate-200 bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl mb-2">No courses yet</h3>
          <p className="text-slate-600 mb-6">Unlock a course to see it in your dashboard.</p>
          <Button onClick={() => router.push('/courses')}>Browse Courses</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map((course) => (
            <Card key={course.id} hover>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-32 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-xl">{course.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{course.shortDescription}</p>
                    </div>
                    {course.progressPercent >= 100 && (
                      <Badge variant="success">
                        <Award className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{course.durationText}</span>
                    </div>
                    <span>•</span>
                    <span>{course.completedLectures} lectures completed</span>
                    <span>•</span>
                    <span>{expiryLabel(course)}</span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="text-indigo-600">{course.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${course.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => router.push(`/courses/${course.slug}?resume=1`)}>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      {course.progressPercent >= 100 ? 'Review Course' : 'Continue Learning'}
                    </Button>
                    {course.progressPercent >= 100 && (
                      <Button variant="outline">
                        <Award className="w-4 h-4 mr-2" />
                        Certificate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
