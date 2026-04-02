import { Router } from 'express';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { notifyUser } from '../notifications.js';
import { mapCatalogItem, type CatalogItemRow } from '../platform.js';
import { requireAdminPermission, requireSessionUser } from '../auth/session.js';

type QuestionType = 'multiple_choice' | 'single_select' | 'fill_blank';

type QuestionOptionInput = {
  id: string;
  text: string;
  imageUrl: string | null;
};

type QuestionInput = {
  type: QuestionType;
  prompt: string;
  imageUrl: string | null;
  options: QuestionOptionInput[];
  correctAnswers: string[];
  points: number;
};

type ExamInput = {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  instructorName: string;
  category: string;
  timeLimitMinutes: number;
  attemptsAllowed: number;
  passingScore: number;
  status: 'draft' | 'published';
  tags: string[];
  questions: QuestionInput[];
};

type PracticeExamQuestionRow = {
  id: string;
  exam_item_id: string;
  question_type: QuestionType;
  prompt: string;
  image_url: string | null;
  options: Array<{ id?: string; text?: string; imageUrl?: string | null }> | null;
  correct_answers: string[] | null;
  points: number;
  position: number;
};

type PracticeExamAttemptRow = {
  id: string;
  exam_item_id: string;
  attempt_number: number;
  status: 'in_progress' | 'submitted' | 'auto_submitted';
  score: number;
  total_points: number;
  percentage: string | number;
  passed: boolean;
  passing_score: number;
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
  answers: Record<string, unknown>;
  result_summary: Record<string, unknown>;
};

type PracticeExamMetadata = {
  examMode: string;
  certificateEnabled: boolean;
  resultEmailEnabled: boolean;
  security: {
    disableRightClick: boolean;
    blockDevtoolsShortcuts: boolean;
    hideCorrectAnswers: boolean;
  };
};

type AdminPracticeExamRow = CatalogItemRow & {
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  attempts_taken: number;
};

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

function parsePositiveInt(value: unknown, min = 1): number | null {
  const num = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isInteger(num) || num < min) return null;
  return num;
}

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean)
    .slice(0, 10);
}

function parseMetadata(metadata: Record<string, unknown> | null): PracticeExamMetadata {
  const meta = metadata ?? {};
  const security =
    meta.security && typeof meta.security === 'object' ? (meta.security as Record<string, unknown>) : {};
  return {
    examMode: typeof meta.examMode === 'string' ? meta.examMode : 'timed_secure',
    certificateEnabled: meta.certificateEnabled !== false,
    resultEmailEnabled: meta.resultEmailEnabled !== false,
    security: {
      disableRightClick: security.disableRightClick !== false,
      blockDevtoolsShortcuts: security.blockDevtoolsShortcuts !== false,
      hideCorrectAnswers: security.hideCorrectAnswers !== false,
    },
  };
}

function normalizeOptions(value: unknown): QuestionOptionInput[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry, index) => {
      if (!entry || typeof entry !== 'object') return null;
      const option = entry as Record<string, unknown>;
      const id = parseOptionalString(option.id) ?? `option-${index + 1}`;
      const text = parseOptionalString(option.text);
      if (!text) return null;
      return {
        id,
        text,
        imageUrl: parseOptionalString(option.imageUrl),
      };
    })
    .filter((entry): entry is QuestionOptionInput => Boolean(entry));
}

function parseQuestions(value: unknown): { questions?: QuestionInput[]; error?: string } {
  if (!Array.isArray(value) || value.length === 0) {
    return { error: 'At least one exam question is required.' };
  }

  const questions: QuestionInput[] = [];
  for (const [index, rawQuestion] of value.entries()) {
    if (!rawQuestion || typeof rawQuestion !== 'object') {
      return { error: `Question ${index + 1} is invalid.` };
    }
    const question = rawQuestion as Record<string, unknown>;
    const type =
      question.type === 'multiple_choice' || question.type === 'single_select' || question.type === 'fill_blank'
        ? question.type
        : null;
    if (!type) return { error: `Question ${index + 1} type is invalid.` };

    const prompt = parseOptionalString(question.prompt);
    if (!prompt) return { error: `Question ${index + 1} prompt is required.` };

    const points = parsePositiveInt(question.points ?? 1);
    if (points === null) return { error: `Question ${index + 1} points must be at least 1.` };

    const correctAnswers = Array.isArray(question.correctAnswers)
      ? question.correctAnswers
          .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
          .filter(Boolean)
      : [];
    if (correctAnswers.length === 0) {
      return { error: `Question ${index + 1} must have at least one correct answer.` };
    }

    const options = normalizeOptions(question.options);
    if (type !== 'fill_blank' && options.length < 2) {
      return { error: `Question ${index + 1} needs at least two options.` };
    }

    questions.push({
      type,
      prompt,
      imageUrl: parseOptionalString(question.imageUrl),
      options,
      correctAnswers,
      points,
    });
  }

  return { questions };
}

function parseExamInput(body: Record<string, unknown>): { data?: ExamInput; error?: string } {
  const title = parseOptionalString(body.title);
  if (!title) return { error: 'Title is required.' };
  const description = parseOptionalString(body.description);
  if (!description) return { error: 'Description is required.' };
  const imageUrl = parseOptionalString(body.imageUrl);
  if (!imageUrl) return { error: 'Cover image URL is required.' };
  const price = parsePositiveMoney(body.price);
  if (price === null) return { error: 'Price must be a valid non-negative number.' };
  const instructorName = parseOptionalString(body.instructorName);
  if (!instructorName) return { error: 'Instructor name is required.' };
  const category = parseOptionalString(body.category);
  if (!category) return { error: 'Category is required.' };
  const timeLimitMinutes = parsePositiveInt(body.timeLimitMinutes);
  if (timeLimitMinutes === null) return { error: 'Time limit must be at least 1 minute.' };
  const attemptsAllowed = parsePositiveInt(body.attemptsAllowed);
  if (attemptsAllowed === null) return { error: 'Attempts allowed must be at least 1.' };
  const passingScore = parsePositiveInt(body.passingScore, 0);
  if (passingScore === null || passingScore > 100) return { error: 'Passing score must be between 0 and 100.' };
  const questionResult = parseQuestions(body.questions);
  if (!questionResult.questions) return { error: questionResult.error ?? 'Questions are required.' };

  const slug = normalizeSlug(parseOptionalString(body.slug) ?? title);
  if (!slug) return { error: 'Slug could not be generated.' };

  return {
    data: {
      slug,
      title,
      description,
      imageUrl,
      price,
      instructorName,
      category,
      timeLimitMinutes,
      attemptsAllowed,
      passingScore,
      status: body.status === 'draft' ? 'draft' : 'published',
      tags: parseTags(body.tags),
      questions: questionResult.questions,
    },
  };
}

function normalizeAnswerValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function toLearnerQuestion(row: PracticeExamQuestionRow) {
  return {
    id: row.id,
    type: row.question_type,
    prompt: row.prompt,
    imageUrl: row.image_url,
    options: (row.options ?? []).map((option, index) => ({
      id: typeof option.id === 'string' ? option.id : `option-${index + 1}`,
      text: typeof option.text === 'string' ? option.text : '',
      imageUrl: typeof option.imageUrl === 'string' ? option.imageUrl : null,
    })),
    points: row.points,
  };
}

function toAdminQuestion(row: PracticeExamQuestionRow) {
  return {
    ...toLearnerQuestion(row),
    correctAnswers: row.correct_answers ?? [],
  };
}

function toAttemptSummary(row: PracticeExamAttemptRow) {
  return {
    id: row.id,
    attemptNumber: row.attempt_number,
    status: row.status,
    score: row.score,
    totalPoints: row.total_points,
    percentage: typeof row.percentage === 'number' ? row.percentage : Number(row.percentage),
    passed: row.passed,
    passingScore: row.passing_score,
    startedAt: row.started_at,
    expiresAt: row.expires_at,
    submittedAt: row.submitted_at,
    autoSubmitted: row.status === 'auto_submitted',
  };
}

function scoreAttempt(
  questions: PracticeExamQuestionRow[],
  answers: Record<string, unknown>
): { score: number; totalPoints: number } {
  let score = 0;
  let totalPoints = 0;

  for (const question of questions) {
    totalPoints += question.points;
    const expected = (question.correct_answers ?? []).map(normalizeAnswerValue).sort();
    const rawAnswer = answers[question.id];
    const actual = Array.isArray(rawAnswer)
      ? rawAnswer.map((entry) => normalizeAnswerValue(String(entry))).filter(Boolean).sort()
      : typeof rawAnswer === 'string'
        ? [normalizeAnswerValue(rawAnswer)]
        : [];

    const matches =
      expected.length === actual.length && expected.every((entry, index) => entry === actual[index]);
    if (matches) score += question.points;
  }

  return { score, totalPoints };
}

async function listAdminPracticeExams(sql: NeonQueryFunction<false, false>): Promise<AdminPracticeExamRow[]> {
  return (await sql`
    SELECT
      ci.*,
      COALESCE(attempt_counts.attempts_taken, 0)::int AS attempts_taken
    FROM catalog_items ci
    LEFT JOIN (
      SELECT exam_item_id, COUNT(*)::int AS attempts_taken
      FROM practice_exam_attempts
      GROUP BY exam_item_id
    ) AS attempt_counts ON attempt_counts.exam_item_id = ci.id
    WHERE ci.type = 'practice_exam'
    ORDER BY ci.created_at DESC
  `) as AdminPracticeExamRow[];
}

async function getAdminPracticeExamById(
  sql: NeonQueryFunction<false, false>,
  id: string
): Promise<AdminPracticeExamRow | null> {
  const rows = (await sql`
    SELECT
      ci.*,
      COALESCE(attempt_counts.attempts_taken, 0)::int AS attempts_taken
    FROM catalog_items ci
    LEFT JOIN (
      SELECT exam_item_id, COUNT(*)::int AS attempts_taken
      FROM practice_exam_attempts
      GROUP BY exam_item_id
    ) AS attempt_counts ON attempt_counts.exam_item_id = ci.id
    WHERE ci.id = ${id}
      AND ci.type = 'practice_exam'
    LIMIT 1
  `) as AdminPracticeExamRow[];
  return rows[0] ?? null;
}

async function getPracticeExamQuestions(
  sql: NeonQueryFunction<false, false>,
  examItemId: string
): Promise<PracticeExamQuestionRow[]> {
  return (await sql`
    SELECT id, exam_item_id, question_type, prompt, image_url, options, correct_answers, points, position
    FROM practice_exam_questions
    WHERE exam_item_id = ${examItemId}
    ORDER BY position ASC
  `) as PracticeExamQuestionRow[];
}

async function replacePracticeExamQuestions(
  sql: NeonQueryFunction<false, false>,
  examItemId: string,
  questions: QuestionInput[]
): Promise<void> {
  await sql`
    DELETE FROM practice_exam_questions
    WHERE exam_item_id = ${examItemId}
  `;

  for (const [index, question] of questions.entries()) {
    await sql`
      INSERT INTO practice_exam_questions (
        exam_item_id,
        question_type,
        prompt,
        image_url,
        options,
        correct_answers,
        points,
        position
      )
      VALUES (
        ${examItemId},
        ${question.type},
        ${question.prompt},
        ${question.imageUrl},
        ${JSON.stringify(question.options)}::jsonb,
        ${JSON.stringify(question.correctAnswers)}::jsonb,
        ${question.points},
        ${index + 1}
      )
    `;
  }
}

function toAdminPracticeExam(row: AdminPracticeExamRow, questions: PracticeExamQuestionRow[]) {
  const metadata = parseMetadata(row.metadata);
  return {
    ...mapCatalogItem(row),
    id: row.id,
    productId: row.id,
    status: row.status,
    attemptsTaken: row.attempts_taken,
    timeLimitMinutes: row.time_limit_minutes ?? 0,
    attemptsAllowed: row.attempts_allowed ?? 1,
    passingScore: row.passing_score ?? 0,
    questions: questions.map(toAdminQuestion),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    security: metadata.security,
  };
}

function buildExamMetadata() {
  return {
    examMode: 'timed_secure',
    certificateEnabled: true,
    resultEmailEnabled: true,
    security: {
      disableRightClick: true,
      blockDevtoolsShortcuts: true,
      hideCorrectAnswers: true,
    },
  };
}

export function createAdminPracticeExamsRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  router.get('/practice-exams', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'practice_exams');
      if (!user) return;
      const items = await listAdminPracticeExams(sql);
      const withQuestions = await Promise.all(
        items.map(async (item) => toAdminPracticeExam(item, await getPracticeExamQuestions(sql, item.id)))
      );
      res.json({ items: withQuestions });
    } catch (e) {
      console.error('admin.practice-exams:list', e);
      res.status(500).json({ error: 'Could not load practice exams.' });
    }
  });

  router.get('/practice-exams/:id', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'practice_exams');
      if (!user) return;
      const item = await getAdminPracticeExamById(sql, req.params.id);
      if (!item) {
        res.status(404).json({ error: 'Practice exam not found.' });
        return;
      }
      const questions = await getPracticeExamQuestions(sql, item.id);
      res.json({ item: toAdminPracticeExam(item, questions) });
    } catch (e) {
      console.error('admin.practice-exams:detail', e);
      res.status(500).json({ error: 'Could not load practice exam.' });
    }
  });

  router.post('/practice-exams', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'practice_exams');
      if (!user) return;
      const parsed = parseExamInput((req.body ?? {}) as Record<string, unknown>);
      if (!parsed.data) {
        res.status(400).json({ error: parsed.error ?? 'Invalid practice exam input.' });
        return;
      }
      const input = parsed.data;
      const metadata = buildExamMetadata();
      const rows = await sql`
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
          time_limit_minutes,
          question_count,
          attempts_allowed,
          passing_score,
          tags,
          metadata
        )
        VALUES (
          ${input.slug},
          'practice_exam',
          ${input.title},
          ${input.description},
          ${input.imageUrl},
          ${input.price},
          ${input.status},
          FALSE,
          ${input.instructorName},
          ${input.category},
          ${`${input.timeLimitMinutes} minutes`},
          ${input.timeLimitMinutes},
          ${input.questions.length},
          ${input.attemptsAllowed},
          ${input.passingScore},
          ${input.tags},
          ${JSON.stringify(metadata)}::jsonb
        )
        RETURNING id
      `;
      const itemId = (rows[0] as { id: string }).id;
      await replacePracticeExamQuestions(sql, itemId, input.questions);
      const item = await getAdminPracticeExamById(sql, itemId);
      const questions = await getPracticeExamQuestions(sql, itemId);
      res.status(201).json({ item: item ? toAdminPracticeExam(item, questions) : null });
    } catch (e) {
      console.error('admin.practice-exams:create', e);
      res.status(500).json({ error: 'Could not create practice exam.' });
    }
  });

  router.patch('/practice-exams/:id', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'practice_exams');
      if (!user) return;
      const existing = await getAdminPracticeExamById(sql, req.params.id);
      if (!existing) {
        res.status(404).json({ error: 'Practice exam not found.' });
        return;
      }
      const parsed = parseExamInput((req.body ?? {}) as Record<string, unknown>);
      if (!parsed.data) {
        res.status(400).json({ error: parsed.error ?? 'Invalid practice exam input.' });
        return;
      }
      const input = parsed.data;
      const metadata = buildExamMetadata();
      await sql`
        UPDATE catalog_items
        SET
          slug = ${input.slug},
          title = ${input.title},
          description = ${input.description},
          image_url = ${input.imageUrl},
          price = ${input.price},
          status = ${input.status},
          instructor_name = ${input.instructorName},
          category = ${input.category},
          duration_label = ${`${input.timeLimitMinutes} minutes`},
          time_limit_minutes = ${input.timeLimitMinutes},
          question_count = ${input.questions.length},
          attempts_allowed = ${input.attemptsAllowed},
          passing_score = ${input.passingScore},
          tags = ${input.tags},
          metadata = ${JSON.stringify(metadata)}::jsonb,
          updated_at = NOW()
        WHERE id = ${existing.id}
      `;
      await replacePracticeExamQuestions(sql, existing.id, input.questions);
      const item = await getAdminPracticeExamById(sql, existing.id);
      const questions = await getPracticeExamQuestions(sql, existing.id);
      res.json({ item: item ? toAdminPracticeExam(item, questions) : null });
    } catch (e) {
      console.error('admin.practice-exams:update', e);
      res.status(500).json({ error: 'Could not update practice exam.' });
    }
  });

  return router;
}

export function createLearnerPracticeExamsRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  router.get('/practice-exams/:slug/history', async (req, res) => {
    try {
      const user = await requireSessionUser(req, res, sql);
      if (!user) return;
      const itemRows = (await sql`
        SELECT *
        FROM catalog_items
        WHERE slug = ${req.params.slug}
          AND type = 'practice_exam'
          AND status = 'published'
        LIMIT 1
      `) as CatalogItemRow[];
      const item = itemRows[0] ?? null;
      if (!item) {
        res.status(404).json({ error: 'Practice exam not found.' });
        return;
      }

      const accessRows = await sql`
        SELECT remaining_attempts
        FROM user_entitlements
        WHERE user_id = ${user.id}
          AND item_id = ${item.id}
          AND status = 'active'
          AND (access_expires_at IS NULL OR access_expires_at > NOW())
        LIMIT 1
      `;
      if (accessRows.length === 0) {
        res.status(403).json({ error: 'Purchase this practice exam to attempt it.' });
        return;
      }

      const attempts = (await sql`
        SELECT
          id,
          exam_item_id,
          attempt_number,
          status,
          score,
          total_points,
          percentage,
          passed,
          passing_score,
          started_at,
          expires_at,
          submitted_at,
          answers,
          result_summary
        FROM practice_exam_attempts
        WHERE exam_item_id = ${item.id}
          AND user_id = ${user.id}
        ORDER BY attempt_number DESC
      `) as PracticeExamAttemptRow[];

      const activeAttempt = attempts.find((attempt) => attempt.status === 'in_progress') ?? null;
      res.json({
        item: mapCatalogItem(item),
        remainingAttempts: (accessRows[0] as { remaining_attempts: number | null }).remaining_attempts,
        attempts: attempts.map(toAttemptSummary),
        activeAttempt: activeAttempt ? toAttemptSummary(activeAttempt) : null,
      });
    } catch (e) {
      console.error('learner.practice-exams:history', e);
      res.status(500).json({ error: 'Could not load practice exam history.' });
    }
  });

  router.post('/practice-exams/:slug/start', async (req, res) => {
    try {
      const user = await requireSessionUser(req, res, sql);
      if (!user) return;
      const itemRows = (await sql`
        SELECT *
        FROM catalog_items
        WHERE slug = ${req.params.slug}
          AND type = 'practice_exam'
          AND status = 'published'
        LIMIT 1
      `) as CatalogItemRow[];
      const item = itemRows[0] ?? null;
      if (!item) {
        res.status(404).json({ error: 'Practice exam not found.' });
        return;
      }

      const entitlementRows = await sql`
        SELECT remaining_attempts
        FROM user_entitlements
        WHERE user_id = ${user.id}
          AND item_id = ${item.id}
          AND status = 'active'
          AND (access_expires_at IS NULL OR access_expires_at > NOW())
        LIMIT 1
      `;
      const entitlement = entitlementRows[0] as { remaining_attempts: number | null } | undefined;
      if (!entitlement) {
        res.status(403).json({ error: 'Purchase this practice exam to attempt it.' });
        return;
      }
      if ((entitlement.remaining_attempts ?? 0) <= 0) {
        res.status(400).json({ error: 'No attempts remaining for this exam.' });
        return;
      }

      const activeRows = (await sql`
        SELECT
          id,
          exam_item_id,
          attempt_number,
          status,
          score,
          total_points,
          percentage,
          passed,
          passing_score,
          started_at,
          expires_at,
          submitted_at,
          answers,
          result_summary
        FROM practice_exam_attempts
        WHERE exam_item_id = ${item.id}
          AND user_id = ${user.id}
          AND status = 'in_progress'
        ORDER BY started_at DESC
        LIMIT 1
      `) as PracticeExamAttemptRow[];

      let attempt = activeRows[0] ?? null;
      if (!attempt) {
        const countRows = await sql`
          SELECT COUNT(*)::int AS attempts_taken
          FROM practice_exam_attempts
          WHERE exam_item_id = ${item.id}
            AND user_id = ${user.id}
        `;
        const attemptNumber = ((countRows[0] as { attempts_taken: number }).attempts_taken ?? 0) + 1;
        const rows = await sql`
          INSERT INTO practice_exam_attempts (
            exam_item_id,
            user_id,
            attempt_number,
            status,
            passing_score,
            expires_at
          )
          VALUES (
            ${item.id},
            ${user.id},
            ${attemptNumber},
            'in_progress',
            ${item.passing_score ?? 0},
            NOW() + (${item.time_limit_minutes ?? 60} * INTERVAL '1 minute')
          )
          RETURNING
            id,
            exam_item_id,
            attempt_number,
            status,
            score,
            total_points,
            percentage,
            passed,
            passing_score,
            started_at,
            expires_at,
            submitted_at,
            answers,
            result_summary
        `;
        attempt = rows[0] as PracticeExamAttemptRow;
      }

      const questions = await getPracticeExamQuestions(sql, item.id);
      const metadata = parseMetadata(item.metadata);
      res.json({
        attempt: {
          ...toAttemptSummary(attempt),
          answers: attempt.answers ?? {},
        },
        item: mapCatalogItem(item),
        remainingAttempts: entitlement.remaining_attempts,
        questions: questions.map(toLearnerQuestion),
        security: metadata.security,
      });
    } catch (e) {
      console.error('learner.practice-exams:start', e);
      res.status(500).json({ error: 'Could not start practice exam.' });
    }
  });

  router.post('/practice-exams/:slug/submit', async (req, res) => {
    try {
      const user = await requireSessionUser(req, res, sql);
      if (!user) return;
      const body = (req.body ?? {}) as Record<string, unknown>;
      const attemptId = parseOptionalString(body.attemptId);
      if (!attemptId) {
        res.status(400).json({ error: 'Attempt ID is required.' });
        return;
      }
      const answers =
        body.answers && typeof body.answers === 'object' ? (body.answers as Record<string, unknown>) : {};

      const rows = (await sql`
        SELECT
          pa.id,
          pa.exam_item_id,
          pa.attempt_number,
          pa.status,
          pa.score,
          pa.total_points,
          pa.percentage,
          pa.passed,
          pa.passing_score,
          pa.started_at,
          pa.expires_at,
          pa.submitted_at,
          pa.answers,
          pa.result_summary,
          ci.slug,
          ci.title,
          ci.time_limit_minutes,
          ci.passing_score AS exam_passing_score,
          ci.metadata
        FROM practice_exam_attempts pa
        JOIN catalog_items ci ON ci.id = pa.exam_item_id
        WHERE pa.id = ${attemptId}
          AND pa.user_id = ${user.id}
          AND ci.slug = ${req.params.slug}
          AND ci.type = 'practice_exam'
        LIMIT 1
      `) as Array<
        PracticeExamAttemptRow & {
          slug: string;
          title: string;
          time_limit_minutes: number | null;
          exam_passing_score: number | null;
          metadata: Record<string, unknown> | null;
        }
      >;

      const attempt = rows[0] ?? null;
      if (!attempt) {
        res.status(404).json({ error: 'Practice exam attempt not found.' });
        return;
      }
      if (attempt.status !== 'in_progress') {
        res.json({
          result: {
            ...toAttemptSummary(attempt),
            title: attempt.title,
            remainingAttempts: null,
            certificateIssued: attempt.passed,
          },
        });
        return;
      }

      const questions = await getPracticeExamQuestions(sql, attempt.exam_item_id);
      const scored = scoreAttempt(questions, answers);
      const percentage = scored.totalPoints === 0 ? 0 : Number(((scored.score / scored.totalPoints) * 100).toFixed(2));
      const passingScore = attempt.exam_passing_score ?? 0;
      const passed = percentage >= passingScore;
      const now = new Date();
      const autoSubmitted = now.getTime() >= new Date(attempt.expires_at).getTime();
      const status = autoSubmitted ? 'auto_submitted' : 'submitted';
      const metadata = parseMetadata(attempt.metadata);

      await sql`
        UPDATE practice_exam_attempts
        SET
          status = ${status},
          score = ${scored.score},
          total_points = ${scored.totalPoints},
          percentage = ${percentage},
          passed = ${passed},
          passing_score = ${passingScore},
          submitted_at = NOW(),
          answers = ${JSON.stringify(answers)}::jsonb,
          result_summary = ${JSON.stringify({
            score: scored.score,
            totalPoints: scored.totalPoints,
            percentage,
            passed,
            autoSubmitted,
          })}::jsonb
        WHERE id = ${attempt.id}
      `;

      const entitlementRows = await sql`
        UPDATE user_entitlements
        SET
          remaining_attempts = GREATEST(COALESCE(remaining_attempts, 0) - 1, 0),
          progress_percent = ${Math.round(percentage)},
          last_accessed_at = NOW()
        WHERE user_id = ${user.id}
          AND item_id = ${attempt.exam_item_id}
          AND status = 'active'
        RETURNING remaining_attempts
      `;
      const remainingAttempts =
        (entitlementRows[0] as { remaining_attempts: number | null } | undefined)?.remaining_attempts ?? null;

      if (metadata.resultEmailEnabled) {
        await notifyUser(sql, {
          userId: user.id,
          email: user.email,
          kind: 'practice_exam_result',
          title: `Result for ${attempt.title}`,
          message: `You scored ${scored.score}/${scored.totalPoints} (${percentage}%). Status: ${passed ? 'Pass' : 'Fail'}.`,
          relatedItemId: attempt.exam_item_id,
          metadata: {
            slug: attempt.slug,
            percentage,
            passed,
            passingScore,
            remainingAttempts,
          },
        });
      }

      if (passed && metadata.certificateEnabled) {
        await notifyUser(sql, {
          userId: user.id,
          email: user.email,
          kind: 'practice_exam_certificate',
          title: `Certificate issued for ${attempt.title}`,
          message: `Congratulations. You passed "${attempt.title}" and your certificate has been issued by email.`,
          relatedItemId: attempt.exam_item_id,
          metadata: {
            slug: attempt.slug,
            percentage,
            certificateIssued: true,
          },
        });
      }

      res.json({
        result: {
          id: attempt.id,
          title: attempt.title,
          attemptNumber: attempt.attempt_number,
          status,
          score: scored.score,
          totalPoints: scored.totalPoints,
          percentage,
          passed,
          passingScore,
          submittedAt: now.toISOString(),
          autoSubmitted,
          remainingAttempts,
          certificateIssued: passed && metadata.certificateEnabled,
        },
      });
    } catch (e) {
      console.error('learner.practice-exams:submit', e);
      res.status(500).json({ error: 'Could not submit practice exam.' });
    }
  });

  return router;
}
