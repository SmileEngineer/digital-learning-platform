'use client';

import { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, RefreshCw } from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { AdminNotice, AdminPageHeader, AdminSectionCard } from '@/components/AdminPageChrome';
import { useModuleCategories } from '@/contexts/SiteConfigContext';
import {
  createAdminBook,
  fetchAdminBook,
  fetchAdminBooks,
  updateAdminBook,
  type AdminBook,
  type AdminBookInput,
} from '@/lib/platform-api';

type FormState = {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  price: string;
  authorName: string;
  category: string;
  stockQuantity: string;
  status: 'draft' | 'published';
  tagsText: string;
  isbn: string;
  shippingNotes: string;
  galleryText: string;
};

function createEmptyForm(defaultCategory = 'Books'): FormState {
  return {
    title: '',
    slug: '',
    description: '',
    imageUrl: '',
    price: '0',
    authorName: '',
    category: defaultCategory,
    stockQuantity: '0',
    status: 'published',
    tagsText: '',
    isbn: '',
    shippingNotes: 'Ships via DTDC after order confirmation.',
    galleryText: '',
  };
}

function toFormState(item: AdminBook): FormState {
  return {
    title: item.title,
    slug: item.slug,
    description: item.description,
    imageUrl: item.image,
    price: String(item.price),
    authorName: item.author ?? item.instructor,
    category: item.category ?? 'Books',
    stockQuantity: String(item.stock ?? 0),
    status: item.status,
    tagsText: item.tags.join(', '),
    isbn: item.isbn ?? '',
    shippingNotes: item.shippingNotes ?? '',
    galleryText: item.galleryImages.join('\n'),
  };
}

function toPayload(form: FormState): AdminBookInput {
  return {
    slug: form.slug.trim() || undefined,
    title: form.title.trim(),
    description: form.description.trim(),
    imageUrl: form.imageUrl.trim(),
    price: Number(form.price),
    authorName: form.authorName.trim(),
    category: form.category.trim(),
    stockQuantity: Number(form.stockQuantity),
    status: form.status,
    tags: form.tagsText
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
    isbn: form.isbn.trim() || null,
    shippingNotes: form.shippingNotes.trim() || null,
    galleryImages: form.galleryText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
  };
}

export function ManageBooksPage() {
  const moduleCategories = useModuleCategories();
  const categoryOptions =
    moduleCategories.physicalBook.length > 0 ? moduleCategories.physicalBook : ['Books'];
  const [items, setItems] = useState<AdminBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => createEmptyForm(categoryOptions[0] ?? 'Books'));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  async function loadItems() {
    try {
      setLoading(true);
      const data = await fetchAdminBooks();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load books.');
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
  const availableCategoryOptions = useMemo(
    () =>
      form.category && !categoryOptions.includes(form.category)
        ? [form.category, ...categoryOptions]
        : categoryOptions,
    [categoryOptions, form.category]
  );

  useEffect(() => {
    if (!form.category && categoryOptions.length > 0) {
      setForm((current) => ({ ...current, category: categoryOptions[0] }));
    }
  }, [categoryOptions, form.category]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);
      const payload = toPayload(form);
      const saved = editingId ? await updateAdminBook(editingId, payload) : await createAdminBook(payload);
      setItems((current) => {
        const next = current.filter((item) => item.id !== saved.id);
        return [saved, ...next];
      });
      setEditingId(saved.id);
      setForm(toFormState(saved));
      setEditorOpen(true);
      setMessage(editingId ? 'Book updated successfully.' : 'Book created successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save book.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(id: string) {
    try {
      setLoadingDetailId(id);
      const item = await fetchAdminBook(id);
      setEditingId(item.id);
      setForm(toFormState(item));
      setEditorOpen(true);
      setMessage(`Editing "${item.title}"`);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load book details.');
    } finally {
      setLoadingDetailId(null);
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(createEmptyForm(categoryOptions[0] ?? 'Books'));
    setMessage(null);
    setError(null);
    setEditorOpen(true);
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Manage Physical Books"
        description="Keep bookstore operations tidy with one clear workflow for inventory, shipping details, and checkout visibility."
        stats={[
          { label: 'Books', value: String(orderedItems.length) },
          { label: 'Published', value: String(orderedItems.filter((item) => item.status === 'published').length), tone: 'success' },
          { label: 'In Stock', value: String(orderedItems.filter((item) => (item.stock ?? 0) > 0).length), tone: 'info' },
          { label: 'Editing', value: editingId ? '1 title' : 'None', tone: editingId ? 'warning' : 'default' },
        ]}
        actions={
          <>
          <Button variant="outline" onClick={loadItems}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={resetForm}>
            <Plus className="w-4 h-4 mr-2" />
            Create Book
          </Button>
          </>
        }
      />

      {message && <AdminNotice tone="success">{message}</AdminNotice>}
      {error && <AdminNotice tone="error">{error}</AdminNotice>}

      <div className={editorOpen ? 'grid gap-8 xl:grid-cols-[1.25fr,0.95fr]' : 'space-y-6'}>
        {editorOpen ? (
        <form onSubmit={handleSubmit}>
          <AdminSectionCard
            title={editingId ? 'Edit Book' : 'Create Book'}
            description="Open the editor only when you need to add or revise a physical book."
            badge={
              <Button variant="ghost" onClick={() => setEditorOpen(false)}>
                Close Editor
              </Button>
            }
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
                <textarea value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Cover image URL</span>
                <input value={form.imageUrl} onChange={(e) => setForm((c) => ({ ...c, imageUrl: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Price</span>
                <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((c) => ({ ...c, price: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Author</span>
                <input value={form.authorName} onChange={(e) => setForm((c) => ({ ...c, authorName: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Category</span>
                <select value={form.category} onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                  {availableCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Stock quantity</span>
                <input type="number" min="0" value={form.stockQuantity} onChange={(e) => setForm((c) => ({ ...c, stockQuantity: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Status</span>
                <select value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value as FormState['status'] }))} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">ISBN</span>
                <input value={form.isbn} onChange={(e) => setForm((c) => ({ ...c, isbn: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Tags</span>
                <input value={form.tagsText} onChange={(e) => setForm((c) => ({ ...c, tagsText: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Limited Stock, Bestseller" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-slate-700">Shipping notes</span>
                <textarea value={form.shippingNotes} onChange={(e) => setForm((c) => ({ ...c, shippingNotes: e.target.value }))} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-slate-700">Gallery image URLs</span>
                <textarea value={form.galleryText} onChange={(e) => setForm((c) => ({ ...c, galleryText: e.target.value }))} rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="One image URL per line" />
              </label>
            </div>

            <div className="mt-8 flex gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : editingId ? 'Update Book' : 'Create Book'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset
              </Button>
            </div>
          </AdminSectionCard>
        </form>
        ) : null}

        <AdminSectionCard
          title="Inventory Library"
          description="Review the current inventory first, then open the editor only when needed."
          className="xl:sticky xl:top-24 self-start"
        >
          <div className="space-y-4">
            {loading ? (
              <p className="text-slate-600">Loading books…</p>
            ) : orderedItems.length === 0 ? (
              <p className="text-slate-600">No physical books created yet.</p>
            ) : (
              orderedItems.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <Badge variant={item.status === 'published' ? 'success' : 'warning'}>{item.status}</Badge>
                        <Badge variant={item.stock > 0 ? 'info' : 'error'}>
                          {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                        </Badge>
                      </div>
                      <h3 className="text-lg">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">by {item.author ?? item.instructor}</p>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">{item.description}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item.id)} disabled={loadingDetailId === item.id}>
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
  );
}
