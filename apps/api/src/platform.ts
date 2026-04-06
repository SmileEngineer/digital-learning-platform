import type { NeonQueryFunction } from '@neondatabase/serverless';

export type CatalogItemType =
  | 'course'
  | 'ebook'
  | 'physical_book'
  | 'live_class'
  | 'practice_exam'
  | 'article';

export type CatalogItemRow = {
  id: string;
  slug: string;
  type: CatalogItemType;
  title: string;
  description: string;
  image_url: string;
  price: string | number;
  currency: string;
  status: string;
  featured: boolean;
  instructor_name: string | null;
  author_name: string | null;
  category: string | null;
  duration_label: string | null;
  duration_minutes: number | null;
  students_count: number;
  rating: string | number | null;
  pages: number | null;
  file_format: string | null;
  download_enabled: boolean;
  preview_enabled: boolean;
  preview_count: number;
  stock_quantity: number | null;
  scheduled_at: string | null;
  meeting_url: string | null;
  spots_total: number | null;
  spots_remaining: number | null;
  question_count: number | null;
  time_limit_minutes: number | null;
  passing_score: number | null;
  attempts_allowed: number | null;
  validity_days: number | null;
  tags: string[] | null;
  curriculum: Array<{ title?: string; lectures?: number; duration?: string }> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type CatalogCardDto = {
  id: string;
  productId: string;
  slug: string;
  type: CatalogItemType;
  createdAt?: string;
  category?: string;
  stateName?: string;
  universityName?: string;
  semesterLabel?: string;
  title: string;
  description: string;
  image: string;
  coverImage: string;
  price: number;
  duration: string;
  students: number;
  rating?: number;
  tags: string[];
  instructor: string;
  pages?: number;
  format?: string;
  downloadAllowed?: boolean;
  previewAvailable?: boolean;
  previewCount?: number;
  scheduledAt?: string;
  date?: string;
  time?: string;
  spotsLeft?: number;
  questions?: number;
  timeLimit?: string;
  attempts?: number;
  passingScore?: number;
  author?: string;
  stock?: number;
  liveClassStatus?: string;
  cancellationReason?: string;
  registeredEmailRequired?: boolean;
  meetingProvider?: string;
  joinWindowMinutes?: number;
  validityLabel?: string;
  curriculum: Array<{ title?: string; lectures?: number; duration?: string }>;
};

export function asMoney(value: string | number): number {
  return typeof value === 'number' ? value : Number.parseFloat(value);
}

function formatDateParts(iso: string | null): { date?: string; time?: string } {
  if (!iso) return {};
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return {};
  return {
    date: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
}

export function formatValidityLabel(days: number | null): string {
  if (!days || days <= 0) return 'Lifetime access';
  if (days % 30 === 0) {
    const months = days / 30;
    return `${months} ${months === 1 ? 'month' : 'months'} access`;
  }
  return `${days} days access`;
}

export function mapCatalogItem(row: CatalogItemRow): CatalogCardDto {
  const { date, time } = formatDateParts(row.scheduled_at);
  const metadata = row.metadata ?? {};
  return {
    id: row.slug,
    productId: row.id,
    slug: row.slug,
    type: row.type,
    createdAt: row.created_at,
    category: row.category ?? undefined,
    stateName: typeof metadata.stateName === 'string' ? metadata.stateName : undefined,
    universityName: typeof metadata.universityName === 'string' ? metadata.universityName : undefined,
    semesterLabel: typeof metadata.semesterLabel === 'string' ? metadata.semesterLabel : undefined,
    title: row.title,
    description: row.description,
    image: row.image_url,
    coverImage: row.image_url,
    price: asMoney(row.price),
    duration:
      row.duration_label ??
      (row.time_limit_minutes ? `${row.time_limit_minutes} minutes` : row.pages ? `${row.pages} pages` : ''),
    students: row.students_count,
    rating: row.rating === null ? undefined : asMoney(row.rating),
    tags: row.tags ?? [],
    instructor: row.instructor_name ?? row.author_name ?? 'Kantri Lawyer Team',
    pages: row.pages ?? undefined,
    format: row.file_format ?? undefined,
    downloadAllowed: row.download_enabled,
    previewAvailable: row.preview_enabled,
    previewCount: row.preview_count,
    scheduledAt: row.scheduled_at ?? undefined,
    date,
    time,
    spotsLeft: row.spots_remaining ?? undefined,
    questions: row.question_count ?? undefined,
    timeLimit: row.time_limit_minutes ? `${row.time_limit_minutes} minutes` : undefined,
    attempts: row.attempts_allowed ?? undefined,
    passingScore: row.passing_score ?? undefined,
    author:
      row.author_name ??
      (metadata && typeof metadata.author === 'string' ? metadata.author : undefined),
    stock: row.stock_quantity ?? undefined,
    liveClassStatus: typeof metadata.liveClassStatus === 'string' ? metadata.liveClassStatus : undefined,
    cancellationReason:
      typeof metadata.cancellationReason === 'string' ? metadata.cancellationReason : undefined,
    registeredEmailRequired:
      typeof metadata.registeredEmailRequired === 'boolean' ? metadata.registeredEmailRequired : undefined,
    meetingProvider: typeof metadata.meetingProvider === 'string' ? metadata.meetingProvider : undefined,
    joinWindowMinutes:
      typeof metadata.joinWindowMinutes === 'number' ? metadata.joinWindowMinutes : undefined,
    validityLabel: formatValidityLabel(row.validity_days),
    curriculum: row.curriculum ?? [],
  };
}

export async function listCatalogItems(
  sql: NeonQueryFunction<false, false>,
  options: { type?: CatalogItemType; featured?: boolean; limit?: number; search?: string } = {}
): Promise<CatalogCardDto[]> {
  const type = options.type ?? null;
  const featured = options.featured ?? null;
  const limit = options.limit ?? 24;
  const search = options.search?.trim() ? `%${options.search.trim()}%` : null;

  const rows = (await sql`
    SELECT *
    FROM catalog_items
    WHERE status = 'published'
      AND (${type}::text IS NULL OR type = ${type})
      AND (${featured}::boolean IS NULL OR featured = ${featured})
      AND (
        ${search}::text IS NULL
        OR title ILIKE ${search}
        OR description ILIKE ${search}
        OR COALESCE(category, '') ILIKE ${search}
      )
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as CatalogItemRow[];

  return rows.map(mapCatalogItem);
}

export async function getCatalogItemBySlug(
  sql: NeonQueryFunction<false, false>,
  slug: string
): Promise<CatalogItemRow | null> {
  const rows = (await sql`
    SELECT *
    FROM catalog_items
    WHERE slug = ${slug}
      AND status = 'published'
    LIMIT 1
  `) as CatalogItemRow[];
  return rows[0] ?? null;
}

export function addDays(days: number | null): Date | null {
  if (!days || days <= 0) return null;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
