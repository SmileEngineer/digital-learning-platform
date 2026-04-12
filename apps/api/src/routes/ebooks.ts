import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import type { NeonQueryFunction } from '@neondatabase/serverless';
import { mapCatalogItem, type CatalogItemRow } from '../platform.js';
import { requireAdminPermission, requireSessionUser } from '../auth/session.js';

type EbookPageInput = {
  title: string;
  body: string;
  imageUrl: string | null;
};

type EbookWriteInput = {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  authorName: string;
  category: string;
  fileFormat: string;
  previewCount: number;
  downloadEnabled: boolean;
  status: 'draft' | 'published';
  tags: string[];
  downloadConfirmationMessage: string | null;
  pdfUrl: string | null;
  pageContents: EbookPageInput[];
};

type EbookMetadata = {
  pageContents: EbookPageInput[];
  downloadConfirmationMessage: string | null;
  pdfUrl: string | null;
  readerProtection: {
    disableRightClick: boolean;
    blockDevtoolsShortcuts: boolean;
    singleDeviceNotice: boolean;
  };
};

type EbookAdminRow = CatalogItemRow & {
  status: string;
  created_at: string;
  updated_at: string;
  readers_count: number;
};

function parseOptionalString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function parsePdfUrl(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  } catch {
    return null;
  }
  if (trimmed.length > 2048) return null;
  return trimmed;
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

function parsePageContents(value: unknown): { pages?: EbookPageInput[]; error?: string } {
  if (!Array.isArray(value) || value.length === 0) {
    return { error: 'At least one ebook page is required.' };
  }

  const pages: EbookPageInput[] = [];
  for (const [index, rawPage] of value.entries()) {
    if (!rawPage || typeof rawPage !== 'object') {
      return { error: `Page ${index + 1} is invalid.` };
    }
    const page = rawPage as Record<string, unknown>;
    const title = parseOptionalString(page.title);
    const body = parseOptionalString(page.body);
    if (!title) return { error: `Page ${index + 1} title is required.` };
    if (!body) return { error: `Page ${index + 1} body is required.` };
    pages.push({
      title,
      body,
      imageUrl: parseOptionalString(page.imageUrl),
    });
  }
  return { pages };
}

function parseMetadata(metadata: Record<string, unknown> | null): EbookMetadata {
  const meta = metadata ?? {};
  const protection =
    meta.readerProtection && typeof meta.readerProtection === 'object'
      ? (meta.readerProtection as Record<string, unknown>)
      : {};
  const pageContentsResult = parsePageContents(meta.pageContents);
  const pageContents =
    pageContentsResult.pages ??
    [
      {
        title: 'Preview',
        body: 'This ebook preview is not configured yet.',
        imageUrl: null,
      },
    ];

  return {
    pageContents,
    downloadConfirmationMessage:
      typeof meta.downloadConfirmationMessage === 'string' ? meta.downloadConfirmationMessage : null,
    pdfUrl: parsePdfUrl(meta.pdfUrl),
    readerProtection: {
      disableRightClick:
        typeof protection.disableRightClick === 'boolean' ? protection.disableRightClick : true,
      blockDevtoolsShortcuts:
        typeof protection.blockDevtoolsShortcuts === 'boolean' ? protection.blockDevtoolsShortcuts : true,
      singleDeviceNotice:
        typeof protection.singleDeviceNotice === 'boolean' ? protection.singleDeviceNotice : true,
    },
  };
}

function toAdminEbook(row: EbookAdminRow) {
  const metadata = parseMetadata(row.metadata);
  return {
    ...mapCatalogItem(row),
    id: row.id,
    productId: row.id,
    author: row.author_name ?? undefined,
    status: row.status,
    previewCount: row.preview_count,
    downloadEnabled: row.download_enabled,
    readersCount: row.readers_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    downloadConfirmationMessage: metadata.downloadConfirmationMessage,
    pdfUrl: metadata.pdfUrl,
    pageContents: metadata.pageContents.map((page, index) => ({
      pageNumber: index + 1,
      ...page,
    })),
  };
}

function toReaderResponse(
  row: CatalogItemRow,
  metadata: EbookMetadata,
  options: {
    hasAccess: boolean;
    watermarkText: string;
    qrValue: string | null;
    exposePdfUrl: boolean;
  }
) {
  const pages = (options.hasAccess ? metadata.pageContents : metadata.pageContents.slice(0, Math.max(1, row.preview_count))).map(
    (page, index) => ({
      pageNumber: index + 1,
      title: page.title,
      body: page.body,
      imageUrl: page.imageUrl,
    })
  );

  return {
    item: mapCatalogItem(row),
    hasAccess: options.hasAccess,
    previewOnly: !options.hasAccess,
    pages,
    watermarkText: options.watermarkText,
    qrValue: options.qrValue,
    downloadAllowed: row.download_enabled,
    downloadConfirmationMessage: metadata.downloadConfirmationMessage,
    protection: metadata.readerProtection,
  };
}

function parseEbookInput(body: Record<string, unknown>): { data?: EbookWriteInput; error?: string } {
  const title = parseOptionalString(body.title);
  if (!title) return { error: 'Title is required.' };

  const description = parseOptionalString(body.description);
  if (!description) return { error: 'Description is required.' };

  const imageUrl = parseOptionalString(body.imageUrl);
  if (!imageUrl) return { error: 'Cover image URL is required.' };

  const price = parsePositiveMoney(body.price);
  if (price === null) return { error: 'Price must be a valid non-negative number.' };

  const authorName = parseOptionalString(body.authorName);
  if (!authorName) return { error: 'Author name is required.' };

  const category = parseOptionalString(body.category);
  if (!category) return { error: 'Category is required.' };

  const fileFormat = parseOptionalString(body.fileFormat) ?? 'PDF';
  const status = body.status === 'draft' ? 'draft' : 'published';
  const slugSource = parseOptionalString(body.slug) ?? title;
  const slug = normalizeSlug(slugSource);
  if (!slug) return { error: 'Slug could not be generated.' };

  const parsedPages = parsePageContents(body.pageContents);
  if (!parsedPages.pages) return { error: parsedPages.error ?? 'Page content is required.' };

  const previewCount = parsePositiveInt(body.previewCount ?? 1, { allowZero: true });
  if (previewCount === null) return { error: 'Preview pages must be 0 or greater.' };
  if (previewCount > parsedPages.pages.length) {
    return { error: 'Preview pages cannot exceed the total number of ebook pages.' };
  }

  const pdfUrl = parsePdfUrl(body.pdfUrl);

  return {
    data: {
      slug,
      title,
      description,
      imageUrl,
      price,
      authorName,
      category,
      fileFormat,
      previewCount,
      downloadEnabled: body.downloadEnabled !== false,
      status,
      tags: parseTags(body.tags),
      downloadConfirmationMessage: parseOptionalString(body.downloadConfirmationMessage),
      pdfUrl,
      pageContents: parsedPages.pages,
    },
  };
}

async function listEbooks(sql: NeonQueryFunction<false, false>): Promise<EbookAdminRow[]> {
  return (await sql`
    SELECT
      ci.*,
      COALESCE(active_readers.readers_count, 0)::int AS readers_count
    FROM catalog_items ci
    LEFT JOIN (
      SELECT item_id, COUNT(*)::int AS readers_count
      FROM user_entitlements
      WHERE status = 'active'
      GROUP BY item_id
    ) AS active_readers ON active_readers.item_id = ci.id
    WHERE ci.type = 'ebook'
    ORDER BY ci.created_at DESC
  `) as EbookAdminRow[];
}

async function getEbookById(
  sql: NeonQueryFunction<false, false>,
  id: string
): Promise<EbookAdminRow | null> {
  const rows = (await sql`
    SELECT
      ci.*,
      COALESCE(active_readers.readers_count, 0)::int AS readers_count
    FROM catalog_items ci
    LEFT JOIN (
      SELECT item_id, COUNT(*)::int AS readers_count
      FROM user_entitlements
      WHERE status = 'active'
      GROUP BY item_id
    ) AS active_readers ON active_readers.item_id = ci.id
    WHERE ci.id = ${id}
      AND ci.type = 'ebook'
    LIMIT 1
  `) as EbookAdminRow[];
  return rows[0] ?? null;
}

async function getEbookBySlug(
  sql: NeonQueryFunction<false, false>,
  slug: string
): Promise<CatalogItemRow | null> {
  const rows = (await sql`
    SELECT *
    FROM catalog_items
    WHERE slug = ${slug}
      AND type = 'ebook'
      AND status = 'published'
    LIMIT 1
  `) as CatalogItemRow[];
  return rows[0] ?? null;
}

export function createAdminEbooksRouter(sql: NeonQueryFunction<false, false>, ebookUploadsDir: string): Router {
  const router = Router();

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, ebookUploadsDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${randomUUID()}${ext === '.pdf' ? ext : '.pdf'}`);
    },
  });
  const uploadPdf = multer({
    storage,
    limits: { fileSize: 40 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const okMime = file.mimetype === 'application/pdf';
      const okName = file.originalname.toLowerCase().endsWith('.pdf');
      if (okMime || okName) cb(null, true);
      else cb(new Error('Only PDF files are allowed'));
    },
  });

  router.get('/ebooks', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'ebooks');
      if (!user) return;
      const items = await listEbooks(sql);
      res.json({ items: items.map(toAdminEbook) });
    } catch (e) {
      console.error('admin.ebooks:list', e);
      res.status(500).json({ error: 'Could not load ebooks.' });
    }
  });

  router.post(
    '/ebooks/upload-pdf',
    async (req, res, next) => {
      const user = await requireAdminPermission(req, res, sql, 'ebooks');
      if (!user) return;
      next();
    },
    (req, res, next) => {
      uploadPdf.single('file')(req, res, (err: unknown) => {
        if (err) {
          const message = err instanceof Error ? err.message : 'Upload failed';
          res.status(400).json({ error: message });
          return;
        }
        next();
      });
    },
    (req, res) => {
      try {
        const file = (req as { file?: { filename: string } }).file;
        if (!file) {
          res.status(400).json({ error: 'Missing PDF file (form field name: file).' });
          return;
        }
        const base =
          (process.env.PUBLIC_API_URL && process.env.PUBLIC_API_URL.replace(/\/$/, '')) ||
          `${req.protocol}://${req.get('host')}`;
        const url = `${base}/static/ebooks/${file.filename}`;
        res.json({ url });
      } catch (e) {
        console.error('admin.ebooks:upload', e);
        res.status(500).json({ error: 'Could not upload PDF.' });
      }
    }
  );

  router.get('/ebooks/:id', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'ebooks');
      if (!user) return;
      const item = await getEbookById(sql, req.params.id);
      if (!item) {
        res.status(404).json({ error: 'eBook not found.' });
        return;
      }
      res.json({ item: toAdminEbook(item) });
    } catch (e) {
      console.error('admin.ebooks:detail', e);
      res.status(500).json({ error: 'Could not load ebook.' });
    }
  });

  router.post('/ebooks', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'ebooks');
      if (!user) return;
      const parsed = parseEbookInput((req.body ?? {}) as Record<string, unknown>);
      if (!parsed.data) {
        res.status(400).json({ error: parsed.error ?? 'Invalid ebook input.' });
        return;
      }
      const input = parsed.data;
      const metadata: EbookMetadata = {
        pageContents: input.pageContents,
        downloadConfirmationMessage: input.downloadConfirmationMessage,
        pdfUrl: input.pdfUrl,
        readerProtection: {
          disableRightClick: true,
          blockDevtoolsShortcuts: true,
          singleDeviceNotice: true,
        },
      };

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
          author_name,
          category,
          pages,
          file_format,
          preview_enabled,
          preview_count,
          download_enabled,
          tags,
          metadata
        )
        VALUES (
          ${input.slug},
          'ebook',
          ${input.title},
          ${input.description},
          ${input.imageUrl},
          ${input.price},
          ${input.status},
          FALSE,
          ${input.authorName},
          ${input.category},
          ${input.pageContents.length},
          ${input.fileFormat},
          TRUE,
          ${input.previewCount},
          ${input.downloadEnabled},
          ${input.tags},
          ${JSON.stringify(metadata)}::jsonb
        )
        RETURNING id
      `;

      const item = await getEbookById(sql, (rows[0] as { id: string }).id);
      res.status(201).json({ item: item ? toAdminEbook(item) : null });
    } catch (e) {
      console.error('admin.ebooks:create', e);
      res.status(500).json({ error: 'Could not create ebook.' });
    }
  });

  router.patch('/ebooks/:id', async (req, res) => {
    try {
      const user = await requireAdminPermission(req, res, sql, 'ebooks');
      if (!user) return;
      const existing = await getEbookById(sql, req.params.id);
      if (!existing) {
        res.status(404).json({ error: 'eBook not found.' });
        return;
      }

      const parsed = parseEbookInput((req.body ?? {}) as Record<string, unknown>);
      if (!parsed.data) {
        res.status(400).json({ error: parsed.error ?? 'Invalid ebook input.' });
        return;
      }
      const input = parsed.data;
      const metadata: EbookMetadata = {
        pageContents: input.pageContents,
        downloadConfirmationMessage: input.downloadConfirmationMessage,
        pdfUrl: input.pdfUrl,
        readerProtection: {
          disableRightClick: true,
          blockDevtoolsShortcuts: true,
          singleDeviceNotice: true,
        },
      };

      await sql`
        UPDATE catalog_items
        SET
          slug = ${input.slug},
          title = ${input.title},
          description = ${input.description},
          image_url = ${input.imageUrl},
          price = ${input.price},
          status = ${input.status},
          author_name = ${input.authorName},
          category = ${input.category},
          pages = ${input.pageContents.length},
          file_format = ${input.fileFormat},
          preview_enabled = TRUE,
          preview_count = ${input.previewCount},
          download_enabled = ${input.downloadEnabled},
          tags = ${input.tags},
          metadata = ${JSON.stringify(metadata)}::jsonb,
          updated_at = NOW()
        WHERE id = ${existing.id}
      `;

      const item = await getEbookById(sql, existing.id);
      res.json({ item: item ? toAdminEbook(item) : null });
    } catch (e) {
      console.error('admin.ebooks:update', e);
      res.status(500).json({ error: 'Could not update ebook.' });
    }
  });

  return router;
}

export function createCatalogEbooksRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  router.get('/ebooks/:slug/reader', async (req, res) => {
    try {
      const item = await getEbookBySlug(sql, req.params.slug);
      if (!item) {
        res.status(404).json({ error: 'eBook not found.' });
        return;
      }
      const metadata = parseMetadata(item.metadata);
      res.json(
        toReaderResponse(item, metadata, {
          hasAccess: false,
          watermarkText: 'Preview Only',
          qrValue: null,
          exposePdfUrl: false,
        })
      );
    } catch (e) {
      console.error('catalog.ebooks.reader', e);
      res.status(500).json({ error: 'Could not load ebook preview.' });
    }
  });

  return router;
}

export function createLearnerEbooksRouter(sql: NeonQueryFunction<false, false>): Router {
  const router = Router();

  router.get('/ebooks/:slug/reader', async (req, res) => {
    try {
      const user = await requireSessionUser(req, res, sql);
      if (!user) return;
      const item = await getEbookBySlug(sql, req.params.slug);
      if (!item) {
        res.status(404).json({ error: 'eBook not found.' });
        return;
      }
      const accessRows = await sql`
        SELECT 1
        FROM user_entitlements
        WHERE user_id = ${user.id}
          AND item_id = ${item.id}
          AND status = 'active'
          AND (access_expires_at IS NULL OR access_expires_at > NOW())
        LIMIT 1
      `;
      if (accessRows.length === 0) {
        res.status(403).json({ error: 'Purchase this eBook to access the full reader.' });
        return;
      }

      const phone = user.phone;
      const watermarkText = phone ? `${user.name} • ${phone}` : `${user.name} • ${user.email}`;

      await sql`
        UPDATE user_entitlements
        SET last_accessed_at = NOW()
        WHERE user_id = ${user.id}
          AND item_id = ${item.id}
      `;

      const metadata = parseMetadata(item.metadata);
      res.json(
        toReaderResponse(item, metadata, {
          hasAccess: true,
          watermarkText,
          qrValue: phone ?? user.email,
          exposePdfUrl: true,
        })
      );
    } catch (e) {
      console.error('learner.ebooks.reader', e);
      res.status(500).json({ error: 'Could not load ebook reader.' });
    }
  });

  router.post('/ebooks/:slug/download', async (req, res) => {
    try {
      const user = await requireSessionUser(req, res, sql);
      if (!user) return;
      const item = await getEbookBySlug(sql, req.params.slug);
      if (!item) {
        res.status(404).json({ error: 'eBook not found.' });
        return;
      }
      if (!item.download_enabled) {
        res.status(403).json({ error: 'Download is disabled for this eBook.' });
        return;
      }

      const accessRows = await sql`
        SELECT 1
        FROM user_entitlements
        WHERE user_id = ${user.id}
          AND item_id = ${item.id}
          AND status = 'active'
          AND (access_expires_at IS NULL OR access_expires_at > NOW())
        LIMIT 1
      `;
      if (accessRows.length === 0) {
        res.status(403).json({ error: 'Purchase this eBook to download it.' });
        return;
      }

      const phone = user.phone;
      const watermarkText = phone ? `${user.name} • ${phone}` : `${user.name} • ${user.email}`;
      const metadata = parseMetadata(item.metadata);
      const readerPayload = toReaderResponse(item, metadata, {
        hasAccess: true,
        watermarkText,
        qrValue: phone ?? user.email,
        exposePdfUrl: true,
      });
      res.json({
        filename: metadata.pdfUrl ? `${item.slug}.pdf` : `${item.slug}.html`,
        ...readerPayload,
      });
    } catch (e) {
      console.error('learner.ebooks.download', e);
      res.status(500).json({ error: 'Could not prepare ebook download.' });
    }
  });

  return router;
}
