'use client';

import { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, RefreshCw } from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { AdminNotice, AdminPageHeader, AdminSectionCard } from '@/components/AdminPageChrome';
import {
  createAdminEbook,
  fetchAdminEbook,
  fetchAdminEbooks,
  updateAdminEbook,
  type AdminEbook,
  type AdminEbookInput,
} from '@/lib/platform-api';

type PageFormState = {
  title: string;
  body: string;
  imageUrl: string;
};

type FormState = {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  price: string;
  authorName: string;
  category: string;
  fileFormat: string;
  previewCount: string;
  downloadEnabled: boolean;
  status: 'draft' | 'published';
  tagsText: string;
  downloadConfirmationMessage: string;
  pageContents: PageFormState[];
};

function emptyPage(): PageFormState {
  return {
    title: '',
    body: '',
    imageUrl: '',
  };
}

function createEmptyForm(): FormState {
  return {
    title: '',
    slug: '',
    description: '',
    imageUrl: '',
    price: '0',
    authorName: '',
    category: 'eBooks',
    fileFormat: 'PDF',
    previewCount: '1',
    downloadEnabled: true,
    status: 'published',
    tagsText: '',
    downloadConfirmationMessage:
      'This eBook will be exported with your contact watermark and QR code on every page. Continue?',
    pageContents: [emptyPage()],
  };
}

function toFormState(item: AdminEbook): FormState {
  return {
    title: item.title,
    slug: item.slug,
    description: item.description,
    imageUrl: item.image,
    price: String(item.price),
    authorName: item.author ?? item.instructor,
    category: item.category ?? 'eBooks',
    fileFormat: item.format ?? 'PDF',
    previewCount: String(item.previewCount ?? 1),
    downloadEnabled: item.downloadAllowed ?? true,
    status: item.status,
    tagsText: item.tags.join(', '),
    downloadConfirmationMessage: item.downloadConfirmationMessage ?? '',
    pageContents:
      item.pageContents.length > 0
        ? item.pageContents.map((page) => ({
            title: page.title,
            body: page.body,
            imageUrl: page.imageUrl ?? '',
          }))
        : [emptyPage()],
  };
}

function toPayload(form: FormState): AdminEbookInput {
  return {
    slug: form.slug.trim() || undefined,
    title: form.title.trim(),
    description: form.description.trim(),
    imageUrl: form.imageUrl.trim(),
    price: Number(form.price),
    authorName: form.authorName.trim(),
    category: form.category.trim(),
    fileFormat: form.fileFormat.trim(),
    previewCount: Number(form.previewCount),
    downloadEnabled: form.downloadEnabled,
    status: form.status,
    tags: form.tagsText
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
    downloadConfirmationMessage: form.downloadConfirmationMessage.trim() || null,
    pageContents: form.pageContents.map((page) => ({
      title: page.title.trim(),
      body: page.body.trim(),
      imageUrl: page.imageUrl.trim() || null,
    })),
  };
}

export function ManageEbooksPage() {
  const [items, setItems] = useState<AdminEbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(createEmptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  async function loadItems() {
    try {
      setLoading(true);
      const data = await fetchAdminEbooks();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load admin ebooks.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  const orderedItems = useMemo(
    () => [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [items]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);
      const payload = toPayload(form);
      const saved = editingId ? await updateAdminEbook(editingId, payload) : await createAdminEbook(payload);

      setItems((current) => {
        const next = current.filter((item) => item.id !== saved.id);
        return [saved, ...next];
      });
      setEditingId(saved.id);
      setForm(toFormState(saved));
      setMessage(editingId ? 'eBook updated successfully.' : 'eBook created successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save eBook.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(id: string) {
    try {
      setLoadingDetailId(id);
      setError(null);
      const item = await fetchAdminEbook(id);
      setEditingId(item.id);
      setForm(toFormState(item));
      setMessage(`Editing "${item.title}"`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load ebook details.');
    } finally {
      setLoadingDetailId(null);
    }
  }

  function startCreate() {
    setEditingId(null);
    setForm(createEmptyForm());
    setMessage(null);
    setError(null);
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Manage eBooks"
        description="Publish eBooks with a cleaner editing flow for preview limits, protected reading, and watermarked downloads."
        stats={[
          { label: 'eBooks', value: String(orderedItems.length) },
          { label: 'Published', value: String(orderedItems.filter((item) => item.status === 'published').length), tone: 'success' },
          { label: 'Downloadable', value: String(orderedItems.filter((item) => item.downloadAllowed).length), tone: 'info' },
          { label: 'Editing', value: editingId ? '1 title' : 'None', tone: editingId ? 'warning' : 'default' },
        ]}
        actions={
          <>
          <Button variant="outline" onClick={loadItems}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={startCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New eBook
          </Button>
          </>
        }
      />
      
      {message && <AdminNotice tone="success">{message}</AdminNotice>}
      {error && <AdminNotice tone="error">{error}</AdminNotice>}

      <div className="grid gap-8 xl:grid-cols-[1.3fr,0.9fr]">
        <form onSubmit={handleSubmit}>
          <AdminSectionCard
            title={editingId ? 'Edit eBook' : 'Create eBook'}
            description="Structure reader content and purchase behavior without the page feeling overloaded."
            badge={
              editingId ? (
                <Badge variant={form.status === 'published' ? 'success' : 'warning'}>{form.status}</Badge>
              ) : undefined
            }
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-slate-900">{editingId ? 'Active editing session' : 'New publishing draft'}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Add structured page content so readers can preview before purchase and read the full watermarked copy after purchase.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Title</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Slug</span>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((current) => ({ ...current, slug: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="optional-auto-generated-from-title"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-slate-700">Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Cover image URL</span>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm((current) => ({ ...current, imageUrl: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Price</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Author</span>
                <input
                  value={form.authorName}
                  onChange={(e) => setForm((current) => ({ ...current, authorName: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Category</span>
                <input
                  value={form.category}
                  onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">File format</span>
                <input
                  value={form.fileFormat}
                  onChange={(e) => setForm((current) => ({ ...current, fileFormat: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Preview pages</span>
                <input
                  type="number"
                  min="0"
                  value={form.previewCount}
                  onChange={(e) => setForm((current) => ({ ...current, previewCount: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Status</span>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, status: e.target.value as FormState['status'] }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-slate-700">Tags</span>
                <input
                  value={form.tagsText}
                  onChange={(e) => setForm((current) => ({ ...current, tagsText: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Exam prep, PDF, Bestseller"
                />
              </label>
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg">Download Control</h3>
                  <p className="text-sm text-slate-600">
                    Disable download to keep the eBook in protected web reader mode only.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.downloadEnabled}
                    onChange={(e) => setForm((current) => ({ ...current, downloadEnabled: e.target.checked }))}
                  />
                  Allow download
                </label>
              </div>
              <label className="mt-4 block">
                <span className="mb-2 block text-sm text-slate-700">Download confirmation message</span>
                <textarea
                  value={form.downloadConfirmationMessage}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, downloadConfirmationMessage: e.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl">Page Content</h3>
                  <p className="text-sm text-slate-600">
                    Each entry becomes a visible ebook page in preview or purchased reading mode.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      pageContents: [...current.pageContents, emptyPage()],
                    }))
                  }
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Page
                </Button>
              </div>

              <div className="space-y-4">
                {form.pageContents.map((page, index) => (
                  <div key={index} className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm uppercase tracking-wide text-slate-500">Page {index + 1}</h4>
                      {form.pageContents.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              pageContents: current.pageContents.filter((_, pageIndex) => pageIndex !== index),
                            }))
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4">
                      <label className="block">
                        <span className="mb-2 block text-sm text-slate-700">Page title</span>
                        <input
                          value={page.title}
                          onChange={(e) =>
                            setForm((current) => ({
                              ...current,
                              pageContents: current.pageContents.map((entry, pageIndex) =>
                                pageIndex === index ? { ...entry, title: e.target.value } : entry
                              ),
                            }))
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm text-slate-700">Page body</span>
                        <textarea
                          value={page.body}
                          onChange={(e) =>
                            setForm((current) => ({
                              ...current,
                              pageContents: current.pageContents.map((entry, pageIndex) =>
                                pageIndex === index ? { ...entry, body: e.target.value } : entry
                              ),
                            }))
                          }
                          rows={5}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm text-slate-700">Optional page image URL</span>
                        <input
                          value={page.imageUrl}
                          onChange={(e) =>
                            setForm((current) => ({
                              ...current,
                              pageContents: current.pageContents.map((entry, pageIndex) =>
                                pageIndex === index ? { ...entry, imageUrl: e.target.value } : entry
                              ),
                            }))
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : editingId ? 'Update eBook' : 'Create eBook'}
              </Button>
              <Button type="button" variant="outline" onClick={startCreate}>
                Reset
              </Button>
            </div>
          </AdminSectionCard>
        </form>

        <div className="space-y-6 xl:sticky xl:top-24 self-start">
          <AdminSectionCard
            title="eBook Library"
            description="Review recently added titles and reopen any draft from a cleaner side panel."
          >
            <div className="space-y-4">
              {loading ? (
                <p className="text-slate-600">Preparing eBook list...</p>
              ) : orderedItems.length === 0 ? (
                <p className="text-slate-600">No ebooks created yet.</p>
              ) : (
                orderedItems.map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex gap-2 mb-2 flex-wrap">
                          <Badge variant={item.status === 'published' ? 'success' : 'warning'}>
                            {item.status}
                          </Badge>
                          <Badge variant={item.downloadAllowed ? 'new' : 'warning'}>
                            {item.downloadAllowed ? 'Download on' : 'Read only'}
                          </Badge>
                        </div>
                        <h3 className="text-lg">{item.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.pages ?? 0} pages • {item.previewCount ?? 0} preview • {item.readersCount} active reader(s)
                        </p>
                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{item.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item.id)}
                        disabled={loadingDetailId === item.id}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {loadingDetailId === item.id ? 'Loading…' : 'Edit'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}
