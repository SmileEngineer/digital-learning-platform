import { readAuthError } from '@/lib/api';

export type CourseAccessType = 'lifetime' | 'fixed_months';
export type CourseStatus = 'draft' | 'published';
export type UserRole = 'student' | 'admin' | 'staff' | 'super_admin';

export type CourseSummary = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  instructorName: string;
  imageUrl: string;
  category: string;
  stateName: string | null;
  universityName: string | null;
  semesterLabel: string | null;
  price: number;
  durationText: string;
  rating: number;
  tag: string | null;
  totalLectures: number;
  previewLectureCount: number;
  accessType: CourseAccessType;
  accessMonths: number | null;
  studentsCount: number;
  learningPoints: string[];
  requirements: string[];
  finalQuizTitle: string | null;
  finalQuizQuestionCount: number;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
};

export type CourseDetail = CourseSummary & {
  hasAccess: boolean;
  isPurchased: boolean;
  accessExpiresAt: string | null;
  progressPercent: number;
  completedLectures: number;
  resumeLectureId: string | null;
  sections: Array<{
    id: string;
    title: string;
    position: number;
    quizTitle: string | null;
    quizQuestionCount: number;
    lectures: Array<{
      id: string;
      title: string;
      durationText: string;
      videoUrl: string | null;
      position: number;
      isPreview: boolean;
      quizTitle: string | null;
      quizQuestionCount: number;
    }>;
  }>;
};

export type AdminCourse = CourseSummary & {
  sections: CourseDetail['sections'];
};

export type PurchasedCourse = CourseSummary & {
  hasAccess: true;
  isPurchased: true;
  accessExpiresAt: string | null;
  purchasedAt: string;
  progressPercent: number;
  completedLectures: number;
  resumeLectureId?: string | null;
};

export type AdminCourseInput = {
  slug?: string;
  title: string;
  shortDescription: string;
  description: string;
  instructorName: string;
  imageUrl: string;
  category: string;
  stateName?: string | null;
  universityName?: string | null;
  semesterLabel?: string | null;
  price: number;
  durationText: string;
  tag?: string | null;
  accessType: CourseAccessType;
  accessMonths?: number | null;
  status: CourseStatus;
  learningPoints: string[];
  requirements: string[];
  finalQuizTitle?: string | null;
  finalQuizQuestionCount?: number;
  sections: Array<{
    title: string;
    quizTitle?: string | null;
    quizQuestionCount?: number;
    lectures: Array<{
      title: string;
      durationText: string;
      videoUrl?: string | null;
      isPreview: boolean;
      quizTitle?: string | null;
      quizQuestionCount?: number;
    }>;
  }>;
};

async function parseJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

const courseListCache = new Map<string, { expiresAt: number; promise: Promise<CourseSummary[]> }>();
const COURSE_LIST_CACHE_MS = 60_000;

export async function fetchCourses(query?: { q?: string; category?: string }): Promise<CourseSummary[]> {
  const params = new URLSearchParams();
  if (query?.q) params.set('q', query.q);
  if (query?.category && query.category !== 'All') params.set('category', query.category);
  const cacheKey = params.toString() || 'all';
  const cached = courseListCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.promise;

  const res = await fetch(`/api/courses${params.size ? `?${params.toString()}` : ''}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await readAuthError(res));
  const promise = parseJson<{ courses: CourseSummary[] }>(res)
    .then((data) => data.courses)
    .catch((error) => {
      courseListCache.delete(cacheKey);
      throw error;
    });
  courseListCache.set(cacheKey, { expiresAt: Date.now() + COURSE_LIST_CACHE_MS, promise });
  return promise;
}

export async function fetchCourseDetail(
  slug: string
): Promise<{ course: CourseDetail; relatedCourses: CourseSummary[] }> {
  const res = await fetch(`/api/courses/${slug}`, {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await readAuthError(res));
  return parseJson<{ course: CourseDetail; relatedCourses: CourseSummary[] }>(res);
}

export async function purchaseCourse(slug: string): Promise<CourseDetail> {
  const res = await fetch(`/api/courses/${slug}/purchase`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await readAuthError(res));
  return (await parseJson<{ course: CourseDetail }>(res)).course;
}

export async function fetchMyCourses(): Promise<PurchasedCourse[]> {
  const res = await fetch('/api/dashboard/courses', {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await readAuthError(res));
  return (await parseJson<{ courses: PurchasedCourse[] }>(res)).courses;
}

export async function saveCourseProgress(
  slug: string,
  lectureId: string
): Promise<{ progressPercent: number; completedLectures: number; resumeLectureId: string | null }> {
  const res = await fetch(`/api/courses/${slug}/progress`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lectureId }),
  });
  if (!res.ok) throw new Error(await readAuthError(res));
  return parseJson<{ progressPercent: number; completedLectures: number; resumeLectureId: string | null }>(res);
}

export async function fetchAdminCourses(): Promise<CourseSummary[]> {
  const res = await fetch('/api/admin/courses', {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await readAuthError(res));
  return (await parseJson<{ courses: CourseSummary[] }>(res)).courses;
}

export async function fetchAdminCourse(id: string): Promise<AdminCourse> {
  const res = await fetch(`/api/admin/courses/${id}`, {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await readAuthError(res));
  return (await parseJson<{ course: AdminCourse }>(res)).course;
}

export async function createAdminCourse(input: AdminCourseInput): Promise<AdminCourse> {
  const res = await fetch('/api/admin/courses', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readAuthError(res));
  courseListCache.clear();
  return (await parseJson<{ course: AdminCourse }>(res)).course;
}

export async function updateAdminCourse(id: string, input: AdminCourseInput): Promise<AdminCourse> {
  const res = await fetch(`/api/admin/courses/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readAuthError(res));
  courseListCache.clear();
  return (await parseJson<{ course: AdminCourse }>(res)).course;
}
