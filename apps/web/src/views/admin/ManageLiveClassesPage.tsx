'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Edit, Plus, RefreshCw, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import {
  createAdminLiveClass,
  fetchAdminLiveClasses,
  refundAdminLiveClass,
  updateAdminLiveClass,
  type AdminLiveClass,
  type AdminLiveClassInput,
} from '@/lib/platform-api';

type FormState = {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  price: string;
  instructorName: string;
  category: string;
  durationLabel: string;
  durationMinutes: string;
  scheduledAt: string;
  spotsTotal: string;
  meetingUrl: string;
  meetingProvider: string;
  status: AdminLiveClassInput['status'];
  joinWindowMinutes: string;
  registeredEmailRequired: boolean;
  tagsText: string;
  agendaText: string;
  cancellationReason: string;
};

const emptyForm: FormState = {
  title: '',
  slug: '',
  description: '',
  imageUrl: '',
  price: '0',
  instructorName: '',
  category: 'Live Classes',
  durationLabel: '',
  durationMinutes: '90',
  scheduledAt: '',
  spotsTotal: '50',
  meetingUrl: '',
  meetingProvider: 'google_meet',
  status: 'scheduled',
  joinWindowMinutes: '30',
  registeredEmailRequired: true,
  tagsText: '',
  agendaText: '',
  cancellationReason: '',
};

function toLocalDateTimeInput(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toFormState(item: AdminLiveClass): FormState {
  return {
    title: item.title,
    slug: item.slug,
    description: item.description,
    imageUrl: item.image,
    price: String(item.price),
    instructorName: item.instructor,
    category: item.category ?? 'Live Classes',
    durationLabel: item.duration,
    durationMinutes: item.duration.match(/\d+/)?.[0] ?? '90',
    scheduledAt: toLocalDateTimeInput(item.scheduledAt),
    spotsTotal: item.spotsTotal ? String(item.spotsTotal) : '',
    meetingUrl: item.meetingUrl ?? '',
    meetingProvider: item.meetingProvider ?? 'google_meet',
    status:
      item.liveClassStatus === 'cancelled' ||
      item.liveClassStatus === 'rescheduled' ||
      item.liveClassStatus === 'completed'
        ? item.liveClassStatus
        : 'scheduled',
    joinWindowMinutes: String(item.joinWindowMinutes ?? 30),
    registeredEmailRequired: item.registeredEmailRequired !== false,
    tagsText: item.tags.join(', '),
    agendaText: item.curriculum.map((entry) => [entry.title, entry.duration].filter(Boolean).join(' | ')).join('\n'),
    cancellationReason: item.cancellationReason ?? '',
  };
}

function toPayload(form: FormState): AdminLiveClassInput {
  const scheduledDate = form.scheduledAt ? new Date(form.scheduledAt) : null;
  return {
    slug: form.slug.trim() || undefined,
    title: form.title.trim(),
    description: form.description.trim(),
    imageUrl: form.imageUrl.trim(),
    price: Number(form.price),
    instructorName: form.instructorName.trim(),
    category: form.category.trim(),
    durationLabel: form.durationLabel.trim(),
    durationMinutes: Number(form.durationMinutes),
    scheduledAt: scheduledDate ? scheduledDate.toISOString() : '',
    spotsTotal: form.spotsTotal.trim() ? Number(form.spotsTotal) : null,
    meetingUrl: form.meetingUrl.trim(),
    meetingProvider: form.meetingProvider.trim(),
    status: form.status,
    joinWindowMinutes: Number(form.joinWindowMinutes),
    registeredEmailRequired: form.registeredEmailRequired,
    tags: form.tagsText
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
    agenda: form.agendaText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [title, duration] = line.split('|').map((part) => part.trim());
        return duration ? { title, duration } : { title };
      }),
    cancellationReason: form.cancellationReason.trim() || null,
  };
}

export function ManageLiveClassesPage() {
  const [items, setItems] = useState<AdminLiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refundingId, setRefundingId] = useState<string | null>(null);

  async function loadItems() {
    try {
      setLoading(true);
      const data = await fetchAdminLiveClasses();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load live classes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  const orderedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      }),
    [items]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const payload = toPayload(form);
      const result = editingId
        ? await updateAdminLiveClass(editingId, payload)
        : { item: await createAdminLiveClass(payload), notifiedUsers: 0 };

      setItems((current) => {
        const next = current.filter((item) => item.id !== result.item.id);
        return [result.item, ...next];
      });
      setEditingId(result.item.id);
      setForm(toFormState(result.item));
      setMessage(
        editingId
          ? result.notifiedUsers > 0
            ? `Live class updated. ${result.notifiedUsers} enrolled learner(s) were notified.`
            : 'Live class updated successfully.'
          : 'Live class created successfully.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save live class.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRefund(item: AdminLiveClass) {
    if (!window.confirm(`Refund all enrolled learners for "${item.title}"?`)) return;
    try {
      setRefundingId(item.id);
      setMessage(null);
      setError(null);
      const result = await refundAdminLiveClass(item.id);
      setItems((current) => current.map((entry) => (entry.id === item.id ? result.item : entry)));
      setMessage(`Refund processed for ${result.refundedUsers} learner(s).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not process refunds.');
    } finally {
      setRefundingId(null);
    }
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage(null);
    setError(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl">Manage Live Classes</h1>
          <p className="text-slate-600 mt-2">
            Schedule, reschedule, cancel, and refund Google Meet based live classes from one panel.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => void loadItems()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={startCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Class
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <h2 className="text-xl mb-4">{editingId ? 'Edit Live Class' : 'Create Live Class'}</h2>
        {message && <p className="mb-4 text-sm text-green-700">{message}</p>}
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Title</span>
              <input
                value={form.title}
                onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Slug</span>
              <input
                value={form.slug}
                onChange={(e) => setForm((current) => ({ ...current, slug: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="optional-auto-generated"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-slate-700">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 min-h-28"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Instructor</span>
              <input
                value={form.instructorName}
                onChange={(e) => setForm((current) => ({ ...current, instructorName: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Category</span>
              <input
                value={form.category}
                onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                required
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-slate-700">Image URL</span>
              <input
                value={form.imageUrl}
                onChange={(e) => setForm((current) => ({ ...current, imageUrl: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                required
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
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Duration Label</span>
              <input
                value={form.durationLabel}
                onChange={(e) => setForm((current) => ({ ...current, durationLabel: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="2.5 hours"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Duration Minutes</span>
              <input
                type="number"
                min="1"
                value={form.durationMinutes}
                onChange={(e) => setForm((current) => ({ ...current, durationMinutes: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Scheduled Date & Time</span>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm((current) => ({ ...current, scheduledAt: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Total Seats</span>
              <input
                type="number"
                min="1"
                value={form.spotsTotal}
                onChange={(e) => setForm((current) => ({ ...current, spotsTotal: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Join Window (minutes before start)</span>
              <input
                type="number"
                min="1"
                max="240"
                value={form.joinWindowMinutes}
                onChange={(e) => setForm((current) => ({ ...current, joinWindowMinutes: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Meeting Provider</span>
              <input
                value={form.meetingProvider}
                onChange={(e) => setForm((current) => ({ ...current, meetingProvider: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                required
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-slate-700">Google Meet URL</span>
              <input
                value={form.meetingUrl}
                onChange={(e) => setForm((current) => ({ ...current, meetingUrl: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Status</span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    status: e.target.value as FormState['status'],
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              >
                <option value="scheduled">Scheduled</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
              <input
                type="checkbox"
                checked={form.registeredEmailRequired}
                onChange={(e) =>
                  setForm((current) => ({ ...current, registeredEmailRequired: e.target.checked }))
                }
              />
              <span className="text-sm text-slate-700">Validate meeting access against the registered user email</span>
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-slate-700">Tags (comma separated)</span>
              <input
                value={form.tagsText}
                onChange={(e) => setForm((current) => ({ ...current, tagsText: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="Upcoming, Limited seats"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-slate-700">Agenda (one line per item, optional `Title | 15 min`)</span>
              <textarea
                value={form.agendaText}
                onChange={(e) => setForm((current) => ({ ...current, agendaText: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 min-h-28"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-slate-700">Cancellation Reason</span>
              <textarea
                value={form.cancellationReason}
                onChange={(e) =>
                  setForm((current) => ({ ...current, cancellationReason: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2 min-h-24"
                placeholder="Required when status is cancelled"
              />
            </label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Update Live Class' : 'Create Live Class'}
            </Button>
            <Button type="button" variant="outline" onClick={startCreate}>
              Reset
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 rounded-lg border border-slate-200 bg-slate-100 animate-pulse" />
          ))
        ) : orderedItems.length === 0 ? (
          <Card className="text-center py-12">
            <CalendarClock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No live classes yet. Schedule one to start selling seats.</p>
          </Card>
        ) : (
          orderedItems.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl">{item.title}</h3>
                    <Badge
                      variant={
                        item.liveClassStatus === 'cancelled'
                          ? 'error'
                          : item.liveClassStatus === 'rescheduled'
                            ? 'info'
                            : item.liveClassStatus === 'completed'
                              ? 'success'
                              : 'warning'
                      }
                    >
                      {item.liveClassStatus ?? 'scheduled'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>{item.date} at {item.time}</span>
                    <span>{item.duration}</span>
                    <span>{item.enrolledCount} enrolled</span>
                    <span>{item.refundedCount} refunded</span>
                    <span>{item.spotsLeft ?? 'Unlimited'} seats remaining</span>
                  </div>
                  {item.cancellationReason && (
                    <p className="mt-2 text-sm text-red-600">{item.cancellationReason}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingId(item.id);
                      setForm(toFormState(item));
                      setMessage(null);
                      setError(null);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    disabled={refundingId === item.id || item.liveClassStatus !== 'cancelled'}
                    onClick={() => void handleRefund(item)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {refundingId === item.id ? 'Refunding...' : 'Refund All'}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
