import { Router } from 'express';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import {
  getSessionUser,
  requireAdminUser,
  requireSessionUser,
  type SessionUser,
} from '../auth/request-user.js';

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
  created_at: string;
  updated_at: string;
  students_count?: number;
};

type DbLectureRow = {
  section_id: string;
  section_title: string;
  section_position: number;
  lecture_id: string | null;
  lecture_title: string | null;
  lecture_duration_text: string | null;
  lecture_position: number | null;
  is_preview: boolean | null;
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
  previewLectureCount: number;
  accessType: 'lifetime' | 'fixed_months';
  accessMonths: number | null;
  status: 'draft' | 'published';
  learningPoints: string[];
  requirements: string[];
};

function isAdminRole(role: SessionUser['role'] | null | undefined): boolean {
  return role === 'admin' || role === 'super_admin';
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

  const previewLectureCount = parsePositiveInt(body.previewLectureCount ?? 1, { allowZero: true });
  if (previewLectureCount === null) return { error: 'Preview lecture count must be 0 or greater.' };

  const accessType = body.accessType === 'fixed_months' ? 'fixed_months' : 'lifetime';
  const accessMonths =
    accessType === 'fixed_months' ? parsePositiveInt(body.accessMonths) : null;
  if (accessType === 'fixed_months' && accessMonths === null) {
    return { error: 'Access months must be a positive number for fixed-duration courses.' };
  }

  const status = body.status === 'draft' ? 'draft' : 'published';
  const slugSource = parseOptionalString(body.slug) ?? title;
  const slug = normalizeSlug(slugSource);
  if (!slug) return { error: 'Slug could not be generated.' };

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
      previewLectureCount,
      accessType,
      accessMonths,
      status,
      learningPoints: toStringArray(body.learningPoints),
      requirements: toStringArray(body.requirements),
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

async function getCourseBySlug(
  sql: NeonQueryFunction<false, false>,
  slug: string
): Promise<DbCourseRow | null> {
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

async function getCourseById(
  sql: NeonQueryFunction<false, false>,
  id: string
): Promise<DbCourseRow | null> {
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
) {
  const rows = await sql`
    SELECT user_id, course_id, purchased_at, access_expires_at, progress_percent, completed_lectures
    FROM course_purchases
    WHERE user_id = ${userId}
      AND course_id = ${courseId}
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
    LIMIT 1
  `;
  return rows[0] as
    | {
        user_id: string;
        course_id: string;
        purchased_at: string;
        access_expires_at: string | null;
        progress_percent: number;
        completed_lectures: number;
      }
    | undefined;
}

async function getCourseSections(
  sql: NeonQueryFunction<false, false>,
  courseId: string,
  hasAccess: boolean
) {
  const rows = (await sql`
    SELECT
      s.id AS section_id,
      s.title AS section_title,
      s.position AS section_position,
      l.id AS lecture_id,
      l.title AS lecture_title,
      l.duration_text AS lecture_duration_text,
      l.position AS lecture_position,
      l.is_preview AS is_preview
    FROM course_sections s
    LEFT JOIN course_lectures l ON l.section_id = s.id
    WHERE s.course_id = ${courseId}
    ORDER BY s.position ASC, l.position ASC
  `) as DbLectureRow[];

  const sections = new Map<
    string,
    { id: string; title: string; position: number; lectures: Array<{ id: string; title: string; durationText: string; isPreview: boolean }> }
  >();

  for (const row of rows) {
    const existing =
      sections.get(row.section_id) ??
      { id: row.section_id, title: row.section_title, position: row.section_position, lectures: [] };
    if (row.lecture_id && (hasAccess || row.is_preview)) {
      existing.lectures.push({
        id: row.lecture_id,
        title: row.lecture_title ?? 'Untitled lecture',
        durationText: row.lecture_duration_text ?? '',
        isPreview: Boolean(row.is_preview),
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

      res.json({
        courses: filtered.map((row) => toCourseSummary(row)),
      });
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
      const sections = await getCourseSections(sql, row.id, course.hasAccess);
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
      }

      const purchase = await getCoursePurchase(sql, user.id, row.id);
      res.status(existing ? 200 : 201).json({
        message: existing ? 'Course already unlocked.' : 'Course access granted.',
        course: {
          ...(await appendAccessInfo(sql, row, user)),
          sections: await getCourseSections(sql, row.id, true),
        },
        purchase,
      });
    } catch (error) {
      console.error('courses:purchase', error);
      res.status(500).json({ error: 'Could not unlock course access.' });
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
          COALESCE(COUNT(all_cp.id), 0)::int AS students_count
        FROM course_purchases cp
        JOIN courses c ON c.id = cp.course_id
        LEFT JOIN course_purchases all_cp
          ON all_cp.course_id = c.id
         AND (all_cp.access_expires_at IS NULL OR all_cp.access_expires_at > NOW())
        WHERE cp.user_id = ${user.id}
          AND (cp.access_expires_at IS NULL OR cp.access_expires_at > NOW())
        GROUP BY c.id, cp.purchased_at, cp.access_expires_at, cp.progress_percent, cp.completed_lectures
        ORDER BY cp.purchased_at DESC
      `) as Array<
        DbCourseRow & {
          purchased_at: string;
          access_expires_at: string | null;
          progress_percent: number;
          completed_lectures: number;
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
      const user = await requireAdminUser(sql, req, res);
      if (!user) return;

      const rows = await listCourses(sql, { includeDrafts: true });
      res.json({ courses: rows.map((row) => toCourseSummary(row)) });
    } catch (error) {
      console.error('admin:courses:list', error);
      res.status(500).json({ error: 'Could not load admin courses.' });
    }
  });

  router.post('/courses', async (req, res) => {
    try {
      const user = await requireAdminUser(sql, req, res);
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
          preview_lecture_count,
          access_type,
          access_months,
          status,
          learning_points,
          requirements
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
          ${input.previewLectureCount},
          ${input.accessType},
          ${input.accessMonths},
          ${input.status},
          ${input.learningPoints},
          ${input.requirements}
        )
        RETURNING id
      `;

      const course = await getCourseById(sql, (inserted[0] as { id: string }).id);
      res.status(201).json({ course: course ? toCourseSummary(course) : null });
    } catch (error) {
      console.error('admin:courses:create', error);
      res.status(500).json({ error: 'Could not create course.' });
    }
  });

  router.patch('/courses/:id', async (req, res) => {
    try {
      const user = await requireAdminUser(sql, req, res);
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
          preview_lecture_count = ${input.previewLectureCount},
          access_type = ${input.accessType},
          access_months = ${input.accessMonths},
          status = ${input.status},
          learning_points = ${input.learningPoints},
          requirements = ${input.requirements},
          updated_at = NOW()
        WHERE id = ${existing.id}
      `;

      const course = await getCourseById(sql, existing.id);
      res.json({ course: course ? toCourseSummary(course) : null });
    } catch (error) {
      console.error('admin:courses:update', error);
      res.status(500).json({ error: 'Could not update course.' });
    }
  });

  return router;
}
