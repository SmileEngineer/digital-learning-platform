import { Router } from 'express';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import {
  getSessionUser,
  requireSessionUser,
  type SessionUser,
} from '../auth/request-user.js';
import { requireAdminPermission } from '../auth/session.js';

type DbCourseRow = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  instructor_name: string;
  image_url: string;
  category: string;
  state_name: string | null;
  university_name: string | null;
  semester_label: string | null;
  price: string | number;
  duration_text: string;
  rating: string | number;
  tag: string | null;
  total_lectures: number;
  preview_lecture_count: number;
  access_type: 'lifetime' | 'fixed_months';
  access_months: number | null;
  status: 'draft' | 'published';
  learning_points: unknown;
  requirements: unknown;
  final_quiz_title: string | null;
  final_quiz_question_count: number;
  created_at: string;
  updated_at: string;
  students_count?: number;
};

type DbLectureRow = {
  section_id: string;
  section_title: string;
  section_position: number;
  section_quiz_title: string | null;
  section_quiz_question_count: number;
  lecture_id: string | null;
  lecture_title: string | null;
  lecture_duration_text: string | null;
  lecture_video_url: string | null;
  lecture_position: number | null;
  is_preview: boolean | null;
  lecture_quiz_title: string | null;
  lecture_quiz_question_count: number | null;
};

type CourseLectureInput = {
  title: string;
  durationText: string;
  videoUrl: string | null;
  isPreview: boolean;
  quizTitle: string | null;
  quizQuestionCount: number;
};

type CourseSectionInput = {
  title: string;
  quizTitle: string | null;
  quizQuestionCount: number;
  lectures: CourseLectureInput[];
};

type CourseWriteInput = {
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
  tag: string | null;
  totalLectures: number;
  previewLectureCount: number;
  accessType: 'lifetime' | 'fixed_months';
  accessMonths: number | null;
  status: 'draft' | 'published';
  learningPoints: string[];
  requirements: string[];
  finalQuizTitle: string | null;
  finalQuizQuestionCount: number;
  sections: CourseSectionInput[];
};

type CoursePurchaseRow = {
  user_id: string;
  course_id: string;
  purchased_at: string;
  access_expires_at: string | null;
  progress_percent: number;
  completed_lectures: number;
  last_viewed_lecture_id: string | null;
};

type CourseSectionDto = {
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
};

function isAdminRole(role: SessionUser['role'] | null | undefined): boolean {
  return role === 'staff' || role === 'admin' || role === 'super_admin';
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseOptionalString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function parsePositiveMoney(value: unknown): number | null {
  const num = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(num) || num < 0) return null;
  return Number(num.toFixed(2));
}

function parsePositiveInt(value: unknown, { allowZero = false } = {}): number | null {
  const num = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isInteger(num)) return null;
  if (allowZero ? num < 0 : num <= 0) return null;
  return num;
}

function parseSections(
  value: unknown
): { sections?: CourseSectionInput[]; totalLectures?: number; previewLectureCount?: number; error?: string } {
  if (!Array.isArray(value) || value.length === 0) {
    return { error: 'At least one curriculum section is required.' };
  }

  const sections: CourseSectionInput[] = [];
  let totalLectures = 0;
  let previewLectureCount = 0;

  for (const [sectionIndex, rawSection] of value.entries()) {
    if (!rawSection || typeof rawSection !== 'object') {
      return { error: `Section ${sectionIndex + 1} is invalid.` };
    }
    const section = rawSection as Record<string, unknown>;
    const title = parseOptionalString(section.title);
    if (!title) {
      return { error: `Section ${sectionIndex + 1} title is required.` };
    }
    const quizTitle = parseOptionalString(section.quizTitle);
    const quizQuestionCount = parsePositiveInt(section.quizQuestionCount ?? 0, { allowZero: true });
    if (quizQuestionCount === null) {
      return { error: `Section ${sectionIndex + 1} quiz question count must be 0 or greater.` };
    }
    const rawLectures = section.lectures;
    if (!Array.isArray(rawLectures) || rawLectures.length === 0) {
      return { error: `Section ${sectionIndex + 1} must contain at least one lecture.` };
    }

    const lectures: CourseLectureInput[] = [];
    for (const [lectureIndex, rawLecture] of rawLectures.entries()) {
      if (!rawLecture || typeof rawLecture !== 'object') {
        return { error: `Lecture ${lectureIndex + 1} in section ${sectionIndex + 1} is invalid.` };
      }
      const lecture = rawLecture as Record<string, unknown>;
      const lectureTitle = parseOptionalString(lecture.title);
      if (!lectureTitle) {
        return { error: `Lecture ${lectureIndex + 1} in section ${sectionIndex + 1} requires a title.` };
      }
      const durationText = parseOptionalString(lecture.durationText);
      if (!durationText) {
        return { error: `Lecture ${lectureTitle} requires a duration.` };
      }
      const lectureQuizTitle = parseOptionalString(lecture.quizTitle);
      const lectureQuizQuestionCount = parsePositiveInt(lecture.quizQuestionCount ?? 0, { allowZero: true });
      if (lectureQuizQuestionCount === null) {
        return { error: `Lecture ${lectureTitle} quiz question count must be 0 or greater.` };
      }
      const isPreview = Boolean(lecture.isPreview);
      if (isPreview) previewLectureCount += 1;
      totalLectures += 1;

      lectures.push({
        title: lectureTitle,
        durationText,
        videoUrl: parseOptionalString(lecture.videoUrl),
        isPreview,
        quizTitle: lectureQuizTitle,
        quizQuestionCount: lectureQuizQuestionCount,
      });
    }

    sections.push({
      title,
      quizTitle,
      quizQuestionCount,
      lectures,
    });
  }

  return { sections, totalLectures, previewLectureCount };
}

function parseCourseInput(body: Record<string, unknown>): { data?: CourseWriteInput; error?: string } {
  const title = parseOptionalString(body.title);
  if (!title) return { error: 'Title is required.' };

  const shortDescription = parseOptionalString(body.shortDescription);
  if (!shortDescription) return { error: 'Short description is required.' };

  const description = parseOptionalString(body.description);
  if (!description) return { error: 'Description is required.' };

  const instructorName = parseOptionalString(body.instructorName);
  if (!instructorName) return { error: 'Instructor name is required.' };

  const imageUrl = parseOptionalString(body.imageUrl);
  if (!imageUrl) return { error: 'Image URL is required.' };

  const category = parseOptionalString(body.category);
  if (!category) return { error: 'Category is required.' };

  const durationText = parseOptionalString(body.durationText);
  if (!durationText) return { error: 'Duration is required.' };

  const price = parsePositiveMoney(body.price);
  if (price === null) return { error: 'Price must be a valid number.' };

  const accessType = body.accessType === 'fixed_months' ? 'fixed_months' : 'lifetime';
  const accessMonths = accessType === 'fixed_months' ? parsePositiveInt(body.accessMonths) : null;
  if (accessType === 'fixed_months' && accessMonths === null) {
    return { error: 'Access months must be a positive number for fixed-duration courses.' };
  }

  const status = body.status === 'draft' ? 'draft' : 'published';
  const slugSource = parseOptionalString(body.slug) ?? title;
  const slug = normalizeSlug(slugSource);
  if (!slug) return { error: 'Slug could not be generated.' };

  const parsedSections = parseSections(body.sections);
  if (!parsedSections.sections) {
    return { error: parsedSections.error ?? 'Curriculum is required.' };
  }

  const finalQuizTitle = parseOptionalString(body.finalQuizTitle);
  const finalQuizQuestionCount = parsePositiveInt(body.finalQuizQuestionCount ?? 0, { allowZero: true });
  if (finalQuizQuestionCount === null) {
    return { error: 'Final quiz question count must be 0 or greater.' };
  }

  return {
    data: {
      slug,
      title,
      shortDescription,
      description,
      instructorName,
      imageUrl,
      category,
      stateName: parseOptionalString(body.stateName),
      universityName: parseOptionalString(body.universityName),
      semesterLabel: parseOptionalString(body.semesterLabel),
      price,
      durationText,
      tag: parseOptionalString(body.tag),
      totalLectures: parsedSections.totalLectures ?? 0,
      previewLectureCount: parsedSections.previewLectureCount ?? 0,
      accessType,
      accessMonths,
      status,
      learningPoints: toStringArray(body.learningPoints),
      requirements: toStringArray(body.requirements),
      finalQuizTitle,
      finalQuizQuestionCount,
      sections: parsedSections.sections,
    },
  };
}

function toCourseSummary(row: DbCourseRow) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    description: row.description,
    instructorName: row.instructor_name,
    imageUrl: row.image_url,
    category: row.category,
    stateName: row.state_name,
    universityName: row.university_name,
    semesterLabel: row.semester_label,
    price: Number(row.price),
    durationText: row.duration_text,
    rating: Number(row.rating),
    tag: row.tag,
    totalLectures: row.total_lectures,
    previewLectureCount: row.preview_lecture_count,
    accessType: row.access_type,
    accessMonths: row.access_months,
    status: row.status,
    learningPoints: toStringArray(row.learning_points),
    requirements: toStringArray(row.requirements),
    finalQuizTitle: row.final_quiz_title,
    finalQuizQuestionCount: row.final_quiz_question_count,
    studentsCount: row.students_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listCourses(
  sql: NeonQueryFunction<false, false>,
  opts?: { includeDrafts?: boolean }
): Promise<DbCourseRow[]> {
  const rows = opts?.includeDrafts
    ? await sql`
        SELECT
          c.*,
          COALESCE(COUNT(cp.id), 0)::int AS students_count
        FROM courses c
        LEFT JOIN course_purchases cp
          ON cp.course_id = c.id
         AND (cp.access_expires_at IS NULL OR cp.access_expires_at > NOW())
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `
    : await sql`
        SELECT
          c.*,
          COALESCE(COUNT(cp.id), 0)::int AS students_count
        FROM courses c
        LEFT JOIN course_purchases cp
          ON cp.course_id = c.id
         AND (cp.access_expires_at IS NULL OR cp.access_expires_at > NOW())
        WHERE c.status = 'published'
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `;
  return rows as DbCourseRow[];
}

async function getCourseBySlug(sql: NeonQueryFunction<false, false>, slug: string): Promise<DbCourseRow | null> {
  const rows = await sql`
    SELECT
      c.*,
      COALESCE(COUNT(cp.id), 0)::int AS students_count
    FROM courses c
    LEFT JOIN course_purchases cp
      ON cp.course_id = c.id
     AND (cp.access_expires_at IS NULL OR cp.access_expires_at > NOW())
    WHERE c.slug = ${slug}
    GROUP BY c.id
    LIMIT 1
  `;
  return (rows[0] as DbCourseRow | undefined) ?? null;
}

async function getCourseById(sql: NeonQueryFunction<false, false>, id: string): Promise<DbCourseRow | null> {
  const rows = await sql`
    SELECT
      c.*,
      COALESCE(COUNT(cp.id), 0)::int AS students_count
    FROM courses c
    LEFT JOIN course_purchases cp
      ON cp.course_id = c.id
     AND (cp.access_expires_at IS NULL OR cp.access_expires_at > NOW())
    WHERE c.id = ${id}
    GROUP BY c.id
    LIMIT 1
  `;
  return (rows[0] as DbCourseRow | undefined) ?? null;
}

async function getCoursePurchase(
  sql: NeonQueryFunction<false, false>,
  userId: string,
  courseId: string
): Promise<CoursePurchaseRow | undefined> {
  const rows = await sql`
    SELECT
      user_id,
      course_id,
      purchased_at,
      access_expires_at,
      progress_percent,
      completed_lectures,
      last_viewed_lecture_id
    FROM course_purchases
    WHERE user_id = ${userId}
      AND course_id = ${courseId}
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
    LIMIT 1
  `;
  return rows[0] as CoursePurchaseRow | undefined;
}

async function getCourseSections(
  sql: NeonQueryFunction<false, false>,
  courseId: string,
  opts: { hasAccess: boolean; includeAdminFields?: boolean }
): Promise<CourseSectionDto[]> {
  const rows = (await sql`
    SELECT
      s.id AS section_id,
      s.title AS section_title,
      s.position AS section_position,
      s.quiz_title AS section_quiz_title,
      s.quiz_question_count AS section_quiz_question_count,
      l.id AS lecture_id,
      l.title AS lecture_title,
      l.duration_text AS lecture_duration_text,
      l.video_url AS lecture_video_url,
      l.position AS lecture_position,
      l.is_preview AS is_preview,
      l.quiz_title AS lecture_quiz_title,
      l.quiz_question_count AS lecture_quiz_question_count
    FROM course_sections s
    LEFT JOIN course_lectures l ON l.section_id = s.id
    WHERE s.course_id = ${courseId}
    ORDER BY s.position ASC, l.position ASC
  `) as DbLectureRow[];

  const sections = new Map<string, CourseSectionDto>();
  for (const row of rows) {
    const existing =
      sections.get(row.section_id) ??
      {
        id: row.section_id,
        title: row.section_title,
        position: row.section_position,
        quizTitle: row.section_quiz_title,
        quizQuestionCount: row.section_quiz_question_count,
        lectures: [],
      };

    if (row.lecture_id && (opts.includeAdminFields || opts.hasAccess || row.is_preview)) {
      existing.lectures.push({
        id: row.lecture_id,
        title: row.lecture_title ?? 'Untitled lecture',
        durationText: row.lecture_duration_text ?? '',
        videoUrl: row.lecture_video_url,
        position: row.lecture_position ?? existing.lectures.length + 1,
        isPreview: Boolean(row.is_preview),
        quizTitle: row.lecture_quiz_title,
        quizQuestionCount: row.lecture_quiz_question_count ?? 0,
      });
    }

    sections.set(row.section_id, existing);
  }

  return Array.from(sections.values()).sort((a, b) => a.position - b.position);
}

function accessExpiresAtForCourse(row: DbCourseRow): Date | null {
  if (row.access_type !== 'fixed_months' || !row.access_months) return null;
  const out = new Date();
  out.setMonth(out.getMonth() + row.access_months);
  return out;
}

function calculateProgressPercent(completedLectures: number, totalLectures: number): number {
  if (totalLectures <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((completedLectures / totalLectures) * 100)));
}

async function upsertCourseEntitlement(
  sql: NeonQueryFunction<false, false>,
  input: {
    userId: string;
    courseSlug: string;
    purchasedAt?: string | null;
    accessExpiresAt?: string | null;
    progressPercent?: number;
    markAccessed?: boolean;
  }
) {
  const entitlementRows = await sql`
    SELECT id
    FROM catalog_items
    WHERE slug = ${input.courseSlug}
      AND type = 'course'
    LIMIT 1
  `;
  const entitlementItem = entitlementRows[0] as { id: string } | undefined;
  if (!entitlementItem) return;

  await sql`
    INSERT INTO user_entitlements (
      user_id,
      item_id,
      status,
      purchased_at,
      access_expires_at,
      progress_percent,
      last_accessed_at
    )
    VALUES (
      ${input.userId},
      ${entitlementItem.id},
      'active',
      COALESCE(${input.purchasedAt ?? null}::timestamptz, NOW()),
      ${input.accessExpiresAt ?? null},
      ${input.progressPercent ?? 0},
      ${input.markAccessed ? new Date().toISOString() : null}
    )
    ON CONFLICT (user_id, item_id) DO UPDATE
    SET
      status = 'active',
      purchased_at = COALESCE(user_entitlements.purchased_at, EXCLUDED.purchased_at),
      access_expires_at = EXCLUDED.access_expires_at,
      progress_percent = GREATEST(user_entitlements.progress_percent, EXCLUDED.progress_percent),
      last_accessed_at = CASE
        WHEN EXCLUDED.last_accessed_at IS NOT NULL THEN EXCLUDED.last_accessed_at
        ELSE user_entitlements.last_accessed_at
      END
  `;
}

async function appendAccessInfo(
  sql: NeonQueryFunction<false, false>,
  row: DbCourseRow,
  user: SessionUser | null
) {
  const purchase = user ? await getCoursePurchase(sql, user.id, row.id) : undefined;
  return {
    ...toCourseSummary(row),
    hasAccess: isAdminRole(user?.role) || Boolean(purchase),
    isPurchased: Boolean(purchase),
    accessExpiresAt: purchase?.access_expires_at ?? null,
    progressPercent: purchase?.progress_percent ?? 0,
    completedLectures: purchase?.completed_lectures ?? 0,
    resumeLectureId: purchase?.last_viewed_lecture_id ?? null,
  };
}

async function replaceCourseCurriculum(
  sql: NeonQueryFunction<false, false>,
  courseId: string,
  sections: CourseSectionInput[]
) {
  await sql`
    DELETE FROM course_sections
    WHERE course_id = ${courseId}
  `;

  for (const [sectionIndex, section] of sections.entries()) {
    const insertedSections = await sql`
      INSERT INTO course_sections (
        course_id,
        title,
        position,
        quiz_title,
        quiz_question_count
      )
      VALUES (
        ${courseId},
        ${section.title},
        ${sectionIndex + 1},
        ${section.quizTitle},
        ${section.quizQuestionCount}
      )
      RETURNING id
    `;
    const sectionId = (insertedSections[0] as { id: string }).id;

    for (const [lectureIndex, lecture] of section.lectures.entries()) {
      await sql`
        INSERT INTO course_lectures (
          section_id,
          title,
          duration_text,
          video_url,
          position,
          is_preview,
          quiz_title,
          quiz_question_count
        )
        VALUES (
          ${sectionId},
          ${lecture.title},
          ${lecture.durationText},
          ${lecture.videoUrl},
          ${lectureIndex + 1},
          ${lecture.isPreview},
          ${lecture.quizTitle},
          ${lecture.quizQuestionCount}
        )
      `;
    }
  }
}

function buildCatalogCurriculum(sections: CourseSectionInput[]) {
  return sections.map((section) => ({
    title: section.title,
    lectures: section.lectures.length,
  }));
}

async function syncCourseCatalogItem(
  sql: NeonQueryFunction<false, false>,
  row: DbCourseRow,
  sections: CourseSectionInput[],
  previousSlug?: string | null
) {
  if (previousSlug && previousSlug !== row.slug) {
    await sql`
      DELETE FROM catalog_items
      WHERE type = 'course'
        AND slug = ${previousSlug}
    `;
  }

  const validityDays = row.access_type === 'fixed_months' && row.access_months ? row.access_months * 30 : null;
  const tags = row.tag ? [row.tag] : [];
  const metadata = {
    previewLectures: row.preview_lecture_count,
    accessType: row.access_type,
    accessMonths: row.access_months,
    finalQuizTitle: row.final_quiz_title,
    finalQuizQuestionCount: row.final_quiz_question_count,
    stateName: row.state_name,
    universityName: row.university_name,
    semesterLabel: row.semester_label,
  };

  await sql`
    INSERT INTO catalog_items (
      slug,
      type,
      title,
      description,
      image_url,
      price,
      status,
      featured,
      instructor_name,
      category,
      duration_label,
      students_count,
      rating,
      preview_enabled,
      preview_count,
      validity_days,
      tags,
      curriculum,
      metadata
    )
    VALUES (
      ${row.slug},
      'course',
      ${row.title},
      ${row.short_description},
      ${row.image_url},
      ${row.price},
      ${row.status},
      ${row.tag === 'Bestseller' || row.tag === 'New'},
      ${row.instructor_name},
      ${row.category},
      ${row.duration_text},
      ${row.students_count ?? 0},
      ${row.rating},
      TRUE,
      ${row.preview_lecture_count},
      ${validityDays},
      ${tags},
      ${JSON.stringify(buildCatalogCurriculum(sections))}::jsonb,
      ${JSON.stringify(metadata)}::jsonb
    )
    ON CONFLICT (slug)
    DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      image_url = EXCLUDED.image_url,
      price = EXCLUDED.price,
      status = EXCLUDED.status,
      featured = EXCLUDED.featured,
      instructor_name = EXCLUDED.instructor_name,
      category = EXCLUDED.category,
      duration_label = EXCLUDED.duration_label,
      students_count = EXCLUDED.students_count,
      rating = EXCLUDED.rating,
      preview_enabled = EXCLUDED.preview_enabled,
      preview_count = EXCLUDED.preview_count,
      validity_days = EXCLUDED.validity_days,
      tags = EXCLUDED.tags,
      curriculum = EXCLUDED.curriculum,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
  `;
}

async function getAdminCourseDetail(sql: NeonQueryFunction<false, false>, id: string) {
  const row = await getCourseById(sql, id);
  if (!row) return null;
  const sections = await getCourseSections(sql, row.id, { hasAccess: true, includeAdminFields: true });
  return {
    ...toCourseSummary(row),
    sections,
  };
}

export function createCoursesRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
      const category = typeof req.query.category === 'string' ? req.query.category.trim().toLowerCase() : '';

      const rows = await listCourses(sql);
      const filtered = rows.filter((row) => {
        const matchesQuery =
          !q ||
          row.title.toLowerCase().includes(q) ||
          row.short_description.toLowerCase().includes(q) ||
          row.instructor_name.toLowerCase().includes(q);
        const matchesCategory = !category || row.category.toLowerCase() === category;
        return matchesQuery && matchesCategory;
      });

      res.json({ courses: filtered.map((row) => toCourseSummary(row)) });
    } catch (error) {
      console.error('courses:list', error);
      res.status(500).json({ error: 'Could not load courses.' });
    }
  });

  router.get('/:slug', async (req, res) => {
    try {
      const row = await getCourseBySlug(sql, req.params.slug);
      const user = await getSessionUser(sql, req);

      if (!row || (row.status !== 'published' && !isAdminRole(user?.role))) {
        res.status(404).json({ error: 'Course not found.' });
        return;
      }

      const course = await appendAccessInfo(sql, row, user);
      const sections = await getCourseSections(sql, row.id, { hasAccess: course.hasAccess });
      const relatedRows = (await listCourses(sql))
        .filter((candidate) => candidate.slug !== row.slug && candidate.category === row.category)
        .slice(0, 3);

      res.json({
        course: {
          ...course,
          sections,
        },
        relatedCourses: relatedRows.map((candidate) => toCourseSummary(candidate)),
      });
    } catch (error) {
      console.error('courses:detail', error);
      res.status(500).json({ error: 'Could not load course details.' });
    }
  });

  router.post('/:slug/purchase', async (req, res) => {
    try {
      const user = await requireSessionUser(sql, req, res);
      if (!user) return;

      const row = await getCourseBySlug(sql, req.params.slug);
      if (!row || row.status !== 'published') {
        res.status(404).json({ error: 'Course not found.' });
        return;
      }

      const existing = await getCoursePurchase(sql, user.id, row.id);
      if (!existing) {
        const accessExpiresAt = accessExpiresAtForCourse(row);
        await sql`
          INSERT INTO course_purchases (
            user_id,
            course_id,
            access_expires_at
          )
          VALUES (
            ${user.id},
            ${row.id},
            ${accessExpiresAt ? accessExpiresAt.toISOString() : null}
          )
        `;
        await upsertCourseEntitlement(sql, {
          userId: user.id,
          courseSlug: row.slug,
          accessExpiresAt: accessExpiresAt ? accessExpiresAt.toISOString() : null,
        });
      }

      const purchase = await getCoursePurchase(sql, user.id, row.id);
      if (purchase) {
        await upsertCourseEntitlement(sql, {
          userId: user.id,
          courseSlug: row.slug,
          purchasedAt: purchase.purchased_at,
          accessExpiresAt: purchase.access_expires_at,
          progressPercent: purchase.progress_percent,
        });
      }
      res.status(existing ? 200 : 201).json({
        message: existing ? 'Course already unlocked.' : 'Course access granted.',
        course: {
          ...(await appendAccessInfo(sql, row, user)),
          sections: await getCourseSections(sql, row.id, { hasAccess: true }),
        },
        purchase,
      });
    } catch (error) {
      console.error('courses:purchase', error);
      res.status(500).json({ error: 'Could not unlock course access.' });
    }
  });

  router.post('/:slug/progress', async (req, res) => {
    try {
      const user = await requireSessionUser(sql, req, res);
      if (!user) return;

      const lectureId =
        typeof req.body?.lectureId === 'string' && req.body.lectureId.trim()
          ? req.body.lectureId.trim()
          : null;
      if (!lectureId) {
        res.status(400).json({ error: 'A lectureId is required.' });
        return;
      }

      const row = await getCourseBySlug(sql, req.params.slug);
      if (!row || row.status !== 'published') {
        res.status(404).json({ error: 'Course not found.' });
        return;
      }

      const purchase = await getCoursePurchase(sql, user.id, row.id);
      if (!purchase) {
        res.status(403).json({ error: 'Purchase this course to track progress.' });
        return;
      }

      const lectureRows = await sql`
        WITH ordered_lectures AS (
          SELECT
            l.id,
            ROW_NUMBER() OVER (ORDER BY s.position ASC, l.position ASC)::int AS lecture_number,
            COUNT(*) OVER ()::int AS total_lectures
          FROM course_sections s
          JOIN course_lectures l ON l.section_id = s.id
          WHERE s.course_id = ${row.id}
        )
        SELECT id, lecture_number, total_lectures
        FROM ordered_lectures
        WHERE id = ${lectureId}
        LIMIT 1
      `;

      const lecture = lectureRows[0] as
        | { id: string; lecture_number: number; total_lectures: number }
        | undefined;
      if (!lecture) {
        res.status(404).json({ error: 'Lecture not found for this course.' });
        return;
      }

      const completedLectures = Math.max(purchase.completed_lectures, lecture.lecture_number - 1);
      const progressPercent = Math.max(
        purchase.progress_percent,
        calculateProgressPercent(completedLectures, lecture.total_lectures)
      );

      await sql`
        UPDATE course_purchases
        SET
          completed_lectures = ${completedLectures},
          progress_percent = ${progressPercent},
          last_viewed_lecture_id = ${lecture.id}
        WHERE user_id = ${user.id}
          AND course_id = ${row.id}
      `;

      await upsertCourseEntitlement(sql, {
        userId: user.id,
        courseSlug: row.slug,
        purchasedAt: purchase.purchased_at,
        accessExpiresAt: purchase.access_expires_at,
        progressPercent,
        markAccessed: true,
      });

      res.json({
        progressPercent,
        completedLectures,
        resumeLectureId: lecture.id,
      });
    } catch (error) {
      console.error('courses:progress', error);
      res.status(500).json({ error: 'Could not save course progress.' });
    }
  });

  return router;
}

export function createMeRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  router.get('/courses', async (req, res) => {
    try {
      const user = await requireSessionUser(sql, req, res);
      if (!user) return;

      const rows = (await sql`
        SELECT
          c.*,
          cp.purchased_at,
          cp.access_expires_at,
          cp.progress_percent,
          cp.completed_lectures,
          cp.last_viewed_lecture_id,
          COALESCE(COUNT(all_cp.id), 0)::int AS students_count
        FROM course_purchases cp
        JOIN courses c ON c.id = cp.course_id
        LEFT JOIN course_purchases all_cp
          ON all_cp.course_id = c.id
         AND (all_cp.access_expires_at IS NULL OR all_cp.access_expires_at > NOW())
        WHERE cp.user_id = ${user.id}
          AND (cp.access_expires_at IS NULL OR cp.access_expires_at > NOW())
        GROUP BY
          c.id,
          cp.purchased_at,
          cp.access_expires_at,
          cp.progress_percent,
          cp.completed_lectures,
          cp.last_viewed_lecture_id
        ORDER BY cp.purchased_at DESC
      `) as Array<
        DbCourseRow & {
          purchased_at: string;
          access_expires_at: string | null;
          progress_percent: number;
          completed_lectures: number;
          last_viewed_lecture_id: string | null;
        }
      >;

      res.json({
        courses: rows.map((row) => ({
          ...toCourseSummary(row),
          hasAccess: true,
          isPurchased: true,
          purchasedAt: row.purchased_at,
          accessExpiresAt: row.access_expires_at,
          progressPercent: row.progress_percent,
          completedLectures: row.completed_lectures,
          resumeLectureId: row.last_viewed_lecture_id,
        })),
      });
    } catch (error) {
      console.error('me:courses', error);
      res.status(500).json({ error: 'Could not load purchased courses.' });
    }
  });

  return router;
}

export function createAdminCoursesRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  router.get('/courses', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'courses');
      if (!user) return;

      const rows = await listCourses(sql, { includeDrafts: true });
      res.json({ courses: rows.map((row) => toCourseSummary(row)) });
    } catch (error) {
      console.error('admin:courses:list', error);
      res.status(500).json({ error: 'Could not load admin courses.' });
    }
  });

  router.get('/courses/:id', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'courses');
      if (!user) return;

      const course = await getAdminCourseDetail(sql, req.params.id);
      if (!course) {
        res.status(404).json({ error: 'Course not found.' });
        return;
      }

      res.json({ course });
    } catch (error) {
      console.error('admin:courses:detail', error);
      res.status(500).json({ error: 'Could not load admin course.' });
    }
  });

  router.post('/courses', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'courses');
      if (!user) return;

      const body = req.body as Record<string, unknown>;
      const parsed = parseCourseInput(body);
      if (!parsed.data) {
        res.status(400).json({ error: parsed.error ?? 'Invalid course input.' });
        return;
      }

      const input = parsed.data;
      const inserted = await sql`
        INSERT INTO courses (
          slug,
          title,
          short_description,
          description,
          instructor_name,
          image_url,
          category,
          state_name,
          university_name,
          semester_label,
          price,
          duration_text,
          tag,
          total_lectures,
          preview_lecture_count,
          access_type,
          access_months,
          status,
          learning_points,
          requirements,
          final_quiz_title,
          final_quiz_question_count
        )
        VALUES (
          ${input.slug},
          ${input.title},
          ${input.shortDescription},
          ${input.description},
          ${input.instructorName},
          ${input.imageUrl},
          ${input.category},
          ${input.stateName},
          ${input.universityName},
          ${input.semesterLabel},
          ${input.price},
          ${input.durationText},
          ${input.tag},
          ${input.totalLectures},
          ${input.previewLectureCount},
          ${input.accessType},
          ${input.accessMonths},
          ${input.status},
          ${input.learningPoints},
          ${input.requirements},
          ${input.finalQuizTitle},
          ${input.finalQuizQuestionCount}
        )
        RETURNING id
      `;

      const courseId = (inserted[0] as { id: string }).id;
      await replaceCourseCurriculum(sql, courseId, input.sections);
      const row = await getCourseById(sql, courseId);
      if (row) {
        await syncCourseCatalogItem(sql, row, input.sections);
      }
      const course = await getAdminCourseDetail(sql, courseId);
      res.status(201).json({ course });
    } catch (error) {
      console.error('admin:courses:create', error);
      res.status(500).json({ error: 'Could not create course.' });
    }
  });

  router.patch('/courses/:id', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'courses');
      if (!user) return;

      const existing = await getCourseById(sql, req.params.id);
      if (!existing) {
        res.status(404).json({ error: 'Course not found.' });
        return;
      }

      const body = req.body as Record<string, unknown>;
      const parsed = parseCourseInput(body);
      if (!parsed.data) {
        res.status(400).json({ error: parsed.error ?? 'Invalid course input.' });
        return;
      }

      const input = parsed.data;
      await sql`
        UPDATE courses
        SET
          slug = ${input.slug},
          title = ${input.title},
          short_description = ${input.shortDescription},
          description = ${input.description},
          instructor_name = ${input.instructorName},
          image_url = ${input.imageUrl},
          category = ${input.category},
          state_name = ${input.stateName},
          university_name = ${input.universityName},
          semester_label = ${input.semesterLabel},
          price = ${input.price},
          duration_text = ${input.durationText},
          tag = ${input.tag},
          total_lectures = ${input.totalLectures},
          preview_lecture_count = ${input.previewLectureCount},
          access_type = ${input.accessType},
          access_months = ${input.accessMonths},
          status = ${input.status},
          learning_points = ${input.learningPoints},
          requirements = ${input.requirements},
          final_quiz_title = ${input.finalQuizTitle},
          final_quiz_question_count = ${input.finalQuizQuestionCount},
          updated_at = NOW()
        WHERE id = ${existing.id}
      `;

      await replaceCourseCurriculum(sql, existing.id, input.sections);
      const row = await getCourseById(sql, existing.id);
      if (row) {
        await syncCourseCatalogItem(sql, row, input.sections, existing.slug);
      }
      const course = await getAdminCourseDetail(sql, existing.id);
      res.json({ course });
    } catch (error) {
      console.error('admin:courses:update', error);
      res.status(500).json({ error: 'Could not update course.' });
    }
  });

  return router;
}
