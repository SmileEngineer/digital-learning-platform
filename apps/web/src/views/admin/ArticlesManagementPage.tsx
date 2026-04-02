'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Edit, Plus, RefreshCw } from 'lucide-react';
import { AdminNotice, AdminPageHeader, AdminSectionCard } from '@/components/AdminPageChrome';
import {
  createAdminArticle,
  fetchAdminArticle,
  fetchAdminArticles,
  updateAdminArticle,
  type AdminArticle,
  type AdminArticleInput,
} from '@/lib/platform-api';

type FormState = {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  authorName: string;
  category: string;
  status: 'draft' | 'published';
  featured: boolean;
  tagsText: string;
  content: string;
  videoLinksText: string;
  publishedAt: string;
};

function createEmptyForm(): FormState {
  return {
    title: '',
    slug: '',
    description: '',
    imageUrl: '',
    authorName: '',
    category: 'Articles',
    status: 'published',
    featured: false,
    tagsText: '',
    content: '',
    videoLinksText: '',
    publishedAt: '',
  };
}

function toFormState(item: AdminArticle): FormState {
  return {
    title: item.title,
    slug: item.slug,
    description: item.description,
    imageUrl: item.image,
    authorName: item.author ?? item.instructor,
    category: item.category ?? 'Articles',
    status: item.status,
    featured: item.featured,
    tagsText: item.tags.join(', '),
    content: item.content,
    videoLinksText: item.videoLinks.join('\n'),
    publishedAt: item.publishedAt ? item.publishedAt.slice(0, 16) : '',
  };
}

function toPayload(form: FormState): AdminArticleInput {
  return {
    slug: form.slug.trim() || undefined,
    title: form.title.trim(),
    description: form.description.trim(),
    imageUrl: form.imageUrl.trim(),
    authorName: form.authorName.trim(),
    category: form.category.trim(),
    status: form.status,
    featured: form.featured,
    tags: form.tagsText.split(',').map((value) => value.trim()).filter(Boolean),
    content: form.content.trim(),
    videoLinks: form.videoLinksText.split('\n').map((value) => value.trim()).filter(Boolean),
    publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
  };
}

export function ArticlesManagementPage() {
  const [items, setItems] = useState<AdminArticle[]>([]);
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
      const data = await fetchAdminArticles();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load articles.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  const orderedItems = useMemo(
    () => [...items].sort((a, b) => new Date(b.publishedAt ?? b.id).getTime() - new Date(a.publishedAt ?? a.id).getTime()),
    [items]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = toPayload(form);
      const saved = editingId ? await updateAdminArticle(editingId, payload) : await createAdminArticle(payload);
      setItems((current) => {
        const next = current.filter((item) => item.id !== saved.id);
        return [saved, ...next];
      });
      setEditingId(saved.id);
      setForm(toFormState(saved));
      setMessage(editingId ? 'Article updated successfully.' : 'Article created successfully.');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save article.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(id: string) {
    try {
      setLoadingDetailId(id);
      const item = await fetchAdminArticle(id);
      setEditingId(item.id);
      setForm(toFormState(item));
      setMessage(`Editing "${item.title}"`);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load article details.');
    } finally {
      setLoadingDetailId(null);
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(createEmptyForm());
    setMessage(null);
    setError(null);
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Articles Management"
        description="Publish editorial content with a cleaner split between writing, scheduling, and reviewing live articles."
        stats={[
          { label: 'Articles', value: String(orderedItems.length) },
          { label: 'Published', value: String(orderedItems.filter((item) => item.status === 'published').length), tone: 'success' },
          { label: 'Featured', value: String(orderedItems.filter((item) => item.featured).length), tone: 'info' },
          { label: 'Editing', value: editingId ? '1 article' : 'None', tone: editingId ? 'warning' : 'default' },
        ]}
        actions={
          <>
          <Button variant="outline" onClick={() => void loadItems()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={resetForm}>
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
          </>
        }
      />

      {message && <AdminNotice tone="success">{message}</AdminNotice>}
      {error && <AdminNotice tone="error">{error}</AdminNotice>}

      <div className="grid gap-8 xl:grid-cols-[1.15fr,0.85fr]">
        <form onSubmit={handleSubmit}>
          <AdminSectionCard
            title={editingId ? 'Edit Article' : 'Create Article'}
            description="Write, schedule, and promote article content from a single structured editing area."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Title</span>
                <input value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Slug</span>
                <input value={form.slug} onChange={(e) => setForm((c) => ({ ...c, slug: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="optional-auto-generated-from-title" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-slate-700">Description</span>
                <textarea value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Hero image URL</span>
                <input value={form.imageUrl} onChange={(e) => setForm((c) => ({ ...c, imageUrl: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Author</span>
                <input value={form.authorName} onChange={(e) => setForm((c) => ({ ...c, authorName: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Category</span>
                <input value={form.category} onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Published at</span>
                <input type="datetime-local" value={form.publishedAt} onChange={(e) => setForm((c) => ({ ...c, publishedAt: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Status</span>
                <select value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value as FormState['status'] }))} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
              <label className="inline-flex items-center gap-2 text-sm mt-8">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm((c) => ({ ...c, featured: e.target.checked }))} />
                Featured on articles page
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-slate-700">Tags</span>
                <input value={form.tagsText} onChange={(e) => setForm((c) => ({ ...c, tagsText: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="News, Update, Guide" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-slate-700">Article content</span>
                <textarea value={form.content} onChange={(e) => setForm((c) => ({ ...c, content: e.target.value }))} rows={12} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-slate-700">Video links</span>
                <textarea value={form.videoLinksText} onChange={(e) => setForm((c) => ({ ...c, videoLinksText: e.target.value }))} rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="One video URL per line" />
              </label>
            </div>

            <div className="mt-8 flex gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : editingId ? 'Update Article' : 'Create Article'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset
              </Button>
            </div>
          </AdminSectionCard>
        </form>

        <AdminSectionCard
          title="Article Library"
          description="Browse published and draft entries with the most recent stories always easy to find."
          className="xl:sticky xl:top-24 self-start"
        >
          <div className="space-y-4">
            {loading ? (
              <p className="text-slate-600">Loading articles…</p>
            ) : orderedItems.length === 0 ? (
              <p className="text-slate-600">No articles created yet.</p>
            ) : (
              orderedItems.map((article) => (
                <div key={article.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <Badge variant={article.status === 'published' ? 'success' : 'warning'}>{article.status}</Badge>
                        {article.featured && <Badge variant="info">featured</Badge>}
                      </div>
                      <h3 className="text-lg">{article.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {article.author ?? article.instructor}
                        {article.publishedAt ? ` • ${new Date(article.publishedAt).toLocaleDateString('en-US')}` : ''}
                      </p>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">{article.description}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => void handleEdit(article.id)} disabled={loadingDetailId === article.id}>
                      <Edit className="w-4 h-4 mr-2" />
                      {loadingDetailId === article.id ? 'Loading…' : 'Edit'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </AdminSectionCard>
      </div>
    </div>
  );
}
