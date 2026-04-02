'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Award,
  CheckCircle,
  Clock,
  Globe,
  PlayCircle,
  Shield,
  Signal,
  Star,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CourseCard } from '@/components/CourseCard';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchCourseDetail,
  type CourseDetail,
  type CourseSummary,
} from '@/lib/course-api';

function accessLabel(course: CourseDetail): string {
  if (course.accessType === 'fixed_months' && course.accessMonths) {
    return `${course.accessMonths} months access`;
  }
  return 'Lifetime access';
}

function isEmbedUrl(url: string): boolean {
  return /youtube|youtu\.be|vimeo|loom|embed/i.test(url);
}

export function CourseDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const slug = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await fetchCourseDetail(slug);
        if (!cancelled) {
          setCourse(data.course);
          setRelatedCourses(data.relatedCourses);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load course details.');
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
  }, [slug]);

  const visibleLectureCount = useMemo(
    () => course?.sections.reduce((sum, section) => sum + section.lectures.length, 0) ?? 0,
    [course]
  );

  const selectedLecture = useMemo(() => {
    if (!course) return null;
    const lectures = course.sections.flatMap((section) => section.lectures);
    if (lectures.length === 0) return null;
    return lectures.find((lecture) => lecture.id === selectedLectureId) ?? lectures[0];
  }, [course, selectedLectureId]);

  useEffect(() => {
    if (!course) return;
    const lectures = course.sections.flatMap((section) => section.lectures);
    setSelectedLectureId(lectures[0]?.id ?? null);
  }, [course]);

  function handleCheckoutRedirect() {
    if (!course) return;
    if (!user) {
      router.push(`/login?next=/checkout?product=${encodeURIComponent(course.slug)}`);
      return;
    }
    router.push(`/checkout?product=${encodeURIComponent(course.slug)}`);
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-slate-600">
        Loading course details…
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="text-center py-12">
          <h1 className="text-2xl mb-2">Course unavailable</h1>
          <p className="text-slate-600">{error ?? 'This course could not be found.'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex gap-2 mb-3 flex-wrap">
                {course.tag && (
                  <Badge variant={course.tag === 'Bestseller' ? 'bestseller' : 'new'}>
                    {course.tag}
                  </Badge>
                )}
                <Badge variant="success">{course.status === 'published' ? 'Published' : 'Draft'}</Badge>
                <Badge variant="info">{accessLabel(course)}</Badge>
              </div>
              <h1 className="text-4xl mb-3">{course.title}</h1>
              <p className="text-lg text-slate-600 mb-4">{course.shortDescription}</p>

              <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>{course.rating.toFixed(1)} rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{course.studentsCount} learners</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{course.durationText}</span>
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-600">
                Created by <span className="text-indigo-600">{course.instructorName}</span>
              </div>
            </div>

            <div className="mb-8">
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>

            <Card className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl">Course Player</h2>
                  <p className="text-slate-600 mt-1">
                    {course.hasAccess
                      ? 'Your purchased lectures are unlocked below.'
                      : 'Preview lectures can be watched before purchase.'}
                  </p>
                </div>
                {course.accessExpiresAt && (
                  <Badge variant="warning">
                    Access until {new Date(course.accessExpiresAt).toLocaleDateString()}
                  </Badge>
                )}
              </div>

              {selectedLecture?.videoUrl ? (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
                  {isEmbedUrl(selectedLecture.videoUrl) ? (
                    <iframe
                      src={selectedLecture.videoUrl}
                      title={selectedLecture.title}
                      className="h-96 w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={selectedLecture.videoUrl}
                      controls
                      controlsList="nodownload"
                      className="h-96 w-full"
                      onContextMenu={(event) => event.preventDefault()}
                    />
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500">
                  {course.hasAccess
                    ? 'The selected lecture does not have a video URL yet.'
                    : 'Preview lectures are listed below. Purchase the course to unlock the full video library.'}
                </div>
              )}

              {selectedLecture && (
                <div className="mt-4 rounded-lg bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-lg">{selectedLecture.title}</h3>
                    {selectedLecture.isPreview && <Badge variant="info">Preview</Badge>}
                    {selectedLecture.quizQuestionCount > 0 && (
                      <Badge variant="neutral">
                        {selectedLecture.quizQuestionCount} quiz question{selectedLecture.quizQuestionCount === 1 ? '' : 's'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    Duration: {selectedLecture.durationText}
                    {selectedLecture.quizTitle ? ` • Quiz: ${selectedLecture.quizTitle}` : ''}
                  </p>
                </div>
              )}
            </Card>

            <Card className="mb-8">
              <h2 className="text-2xl mb-4">What you&apos;ll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.learningPoints.map((item) => (
                  <div key={item} className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl">Course Content</h2>
                  <p className="text-slate-600 mt-1">
                    {course.sections.length} sections • {visibleLectureCount} visible lectures
                    {!course.hasAccess && course.previewLectureCount > 0
                      ? ` • preview mode (${course.previewLectureCount} preview lecture${course.previewLectureCount > 1 ? 's' : ''})`
                      : ''}
                  </p>
                </div>
                {!course.hasAccess && (
                  <Badge variant="warning">Only preview lectures are visible until purchase</Badge>
                )}
              </div>

              <div className="space-y-3">
                {course.sections.map((section) => (
                  <details key={section.id} className="bg-slate-50 border border-slate-200 rounded-lg" open>
                    <summary className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors flex items-center justify-between">
                      <span>{section.title}</span>
                      <span className="text-sm text-slate-600">
                        {section.lectures.length} visible lecture{section.lectures.length === 1 ? '' : 's'}
                      </span>
                    </summary>
                    <div className="px-4 py-3 border-t border-slate-200">
                      {(section.quizTitle || section.quizQuestionCount > 0) && (
                        <div className="mb-3 rounded-lg bg-white px-3 py-2 text-sm text-slate-600">
                          Section quiz:
                          {' '}
                          {section.quizTitle ?? 'Section Assessment'}
                          {' '}
                          ({section.quizQuestionCount} questions)
                        </div>
                      )}
                      {section.lectures.length === 0 ? (
                        <p className="text-sm text-slate-500">Locked until course access is unlocked.</p>
                      ) : (
                        <div className="space-y-2">
                          {section.lectures.map((lecture) => (
                            <button
                              type="button"
                              key={lecture.id}
                              className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm ${
                                selectedLecture?.id === lecture.id ? 'bg-indigo-50' : 'hover:bg-white'
                              }`}
                              onClick={() => setSelectedLectureId(lecture.id)}
                            >
                              <div className="flex items-center gap-3">
                                <PlayCircle className="w-4 h-4 text-slate-400" />
                                <span>{lecture.title}</span>
                                {lecture.isPreview && (
                                  <Badge variant="info" size="sm">
                                    Preview
                                  </Badge>
                                )}
                                {lecture.quizQuestionCount > 0 && (
                                  <Badge variant="neutral" size="sm">
                                    Quiz
                                  </Badge>
                                )}
                              </div>
                              <span className="text-slate-600">{lecture.durationText}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </Card>

            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                {course.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>

            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Description</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 whitespace-pre-line">{course.description}</p>
              </div>
            </Card>

            <Card>
              <h2 className="text-2xl mb-4">Instructor</h2>
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-slate-200 rounded-full flex-shrink-0" />
                <div>
                  <h3 className="text-xl mb-1">{course.instructorName}</h3>
                  <p className="text-slate-600 mb-3">Lead instructor</p>
                  <p className="text-slate-700">
                    This course is managed through the admin panel and unlocked according to the access
                    validity configured for each learner purchase.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <div className="text-3xl text-indigo-600 mb-4">${course.price.toFixed(2)}</div>
                {error && (
                  <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {course.hasAccess ? (
                  <Button fullWidth size="lg" className="mb-3" onClick={() => router.push('/dashboard/courses')}>
                    Continue Learning
                  </Button>
                ) : (
                  <Button fullWidth size="lg" className="mb-3" onClick={handleCheckoutRedirect}>
                    Buy Now
                  </Button>
                )}

                <Button
                  fullWidth
                  variant="outline"
                  size="lg"
                  className="mb-6"
                  onClick={handleCheckoutRedirect}
                >
                  Go to Checkout
                </Button>

                <div className="text-center text-sm text-slate-600 mb-6">
                  {course.hasAccess
                    ? 'Full curriculum unlocked for your account.'
                    : 'Preview lectures available before purchase.'}
                </div>

                <div className="space-y-3 border-t border-slate-200 pt-6">
                  <h3 className="mb-3">This course includes:</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span>{course.durationText} of guided learning</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-5 h-5 text-slate-400" />
                    <span>Preview-first access control with video URLs hidden for locked lectures</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="w-5 h-5 text-slate-400" />
                    <span>Instructor-managed curriculum</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="w-5 h-5 text-slate-400" />
                    <span>Access on desktop and mobile</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Signal className="w-5 h-5 text-slate-400" />
                    <span>{accessLabel(course)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {relatedCourses.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl mb-6">Related Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCourses.map((related) => (
                <CourseCard
                  key={related.id}
                  id={related.slug}
                  title={related.title}
                  description={related.shortDescription}
                  image={related.imageUrl}
                  price={related.price}
                  duration={related.durationText}
                  students={related.studentsCount}
                  rating={related.rating}
                  tags={related.tag ? [related.tag] : []}
                  instructor={related.instructorName}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
