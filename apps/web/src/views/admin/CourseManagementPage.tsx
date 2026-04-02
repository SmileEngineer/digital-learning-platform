'use client';

import { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import {
  createAdminCourse,
  fetchAdminCourses,
  updateAdminCourse,
  type AdminCourseInput,
  type CourseSummary,
} from '@/lib/course-api';

type FormState = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  instructorName: string;
  imageUrl: string;
  category: string;
  stateName: string;
  universityName: string;
  semesterLabel: string;
  price: string;
  durationText: string;
  tag: string;
  previewLectureCount: string;
  accessType: 'lifetime' | 'fixed_months';
  accessMonths: string;
  status: 'draft' | 'published';
  learningPointsText: string;
  requirementsText: string;
};

const emptyForm: FormState = {
  title: '',
  slug: '',
  shortDescription: '',
  description: '',
  instructorName: '',
  imageUrl: '',
  category: '',
  stateName: '',
  universityName: '',
  semesterLabel: '',
  price: '0',
  durationText: '',
  tag: '',
  previewLectureCount: '1',
  accessType: 'lifetime',
  accessMonths: '',
  status: 'published',
  learningPointsText: '',
  requirementsText: '',
};

function toFormState(course: CourseSummary): FormState {
  return {
    title: course.title,
    slug: course.slug,
    shortDescription: course.shortDescription,
    description: course.description,
    instructorName: course.instructorName,
    imageUrl: course.imageUrl,
    category: course.category,
    stateName: course.stateName ?? '',
    universityName: course.universityName ?? '',
    semesterLabel: course.semesterLabel ?? '',
    price: String(course.price),
    durationText: course.durationText,
    tag: course.tag ?? '',
    previewLectureCount: String(course.previewLectureCount),
    accessType: course.accessType,
    accessMonths: course.accessMonths ? String(course.accessMonths) : '',
    status: course.status,
    learningPointsText: course.learningPoints.join('\n'),
    requirementsText: course.requirements.join('\n'),
  };
}

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function toPayload(form: FormState): AdminCourseInput {
  return {
    slug: form.slug.trim() || undefined,
    title: form.title.trim(),
    shortDescription: form.shortDescription.trim(),
    description: form.description.trim(),
    instructorName: form.instructorName.trim(),
    imageUrl: form.imageUrl.trim(),
    category: form.category.trim(),
    stateName: form.stateName.trim() || null,
    universityName: form.universityName.trim() || null,
    semesterLabel: form.semesterLabel.trim() || null,
    price: Number(form.price),
    durationText: form.durationText.trim(),
    tag: form.tag.trim() || null,
    previewLectureCount: Number(form.previewLectureCount),
    accessType: form.accessType,
    accessMonths: form.accessType === 'fixed_months' ? Number(form.accessMonths) || null : null,
    status: form.status,
    learningPoints: splitLines(form.learningPointsText),
    requirements: splitLines(form.requirementsText),
  };
}

export function CourseManagementPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadCourses() {
    try {
      setLoading(true);
      const data = await fetchAdminCourses();
      setCourses(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load admin courses.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  const sortedCourses = useMemo(
    () =>
      [...courses].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [courses]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const payload = toPayload(form);
      const saved = editingId
        ? await updateAdminCourse(editingId, payload)
        : await createAdminCourse(payload);

      setCourses((current) => {
        const withoutExisting = current.filter((course) => course.id !== saved.id);
        return [saved, ...withoutExisting];
      });
      setEditingId(saved.id);
      setForm(toFormState(saved));
      setMessage(editingId ? 'Course updated successfully.' : 'Course created successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save course.');
    } finally {
      setSubmitting(false);
    }
  }

  function beginCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage(null);
    setError(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl">Manage Courses</h1>
          <p className="text-slate-600 mt-2">
            Create and update live course metadata, preview rules, and access duration.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => void loadCourses()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={beginCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <h2 className="text-xl mb-4">{editingId ? 'Edit Course' : 'Create Course'}</h2>
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
              <span className="mb-2 block text-sm text-slate-700">Short description</span>
              <input
                value={form.shortDescription}
                onChange={(e) =>
                  setForm((current) => ({ ...current, shortDescription: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                required
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
                onChange={(e) =>
                  setForm((current) => ({ ...current, instructorName: e.target.value }))
                }
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
              <span className="mb-2 block text-sm text-slate-700">State</span>
              <input
                value={form.stateName}
                onChange={(e) => setForm((current) => ({ ...current, stateName: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">University</span>
              <input
                value={form.universityName}
                onChange={(e) =>
                  setForm((current) => ({ ...current, universityName: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Semester</span>
              <input
                value={form.semesterLabel}
                onChange={(e) =>
                  setForm((current) => ({ ...current, semesterLabel: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Tag</span>
              <input
                value={form.tag}
                onChange={(e) => setForm((current) => ({ ...current, tag: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="Bestseller / New"
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
              <span className="mb-2 block text-sm text-slate-700">Duration</span>
              <input
                value={form.durationText}
                onChange={(e) =>
                  setForm((current) => ({ ...current, durationText: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="40 hours"
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Preview lectures</span>
              <input
                type="number"
                min="0"
                value={form.previewLectureCount}
                onChange={(e) =>
                  setForm((current) => ({ ...current, previewLectureCount: e.target.value }))
                }
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
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Access type</span>
              <select
                value={form.accessType}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    accessType: e.target.value as FormState['accessType'],
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              >
                <option value="lifetime">Lifetime</option>
                <option value="fixed_months">Fixed months</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Access months</span>
              <input
                type="number"
                min="1"
                value={form.accessMonths}
                onChange={(e) =>
                  setForm((current) => ({ ...current, accessMonths: e.target.value }))
                }
                disabled={form.accessType !== 'fixed_months'}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 disabled:bg-slate-100"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-slate-700">Learning points</span>
              <textarea
                value={form.learningPointsText}
                onChange={(e) =>
                  setForm((current) => ({ ...current, learningPointsText: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2 min-h-24"
                placeholder="One point per line"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-slate-700">Requirements</span>
              <textarea
                value={form.requirementsText}
                onChange={(e) =>
                  setForm((current) => ({ ...current, requirementsText: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2 min-h-24"
                placeholder="One requirement per line"
              />
            </label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : editingId ? 'Update Course' : 'Create Course'}
            </Button>
            <Button type="button" variant="outline" onClick={beginCreate}>
              Reset
            </Button>
          </div>
        </form>
      </Card>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm">Course</th>
                <th className="text-left px-6 py-3 text-sm">Category</th>
                <th className="text-left px-6 py-3 text-sm">Students</th>
                <th className="text-left px-6 py-3 text-sm">Price</th>
                <th className="text-left px-6 py-3 text-sm">Access</th>
                <th className="text-left px-6 py-3 text-sm">Status</th>
                <th className="text-left px-6 py-3 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    Loading courses…
                  </td>
                </tr>
              ) : sortedCourses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    No courses found.
                  </td>
                </tr>
              ) : (
                sortedCourses.map((course) => (
                  <tr key={course.id} className="border-b border-slate-200 last:border-0">
                    <td className="px-6 py-4">
                      <div>
                        <div>{course.title}</div>
                        <div className="text-xs text-slate-500 mt-1">/{course.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{course.category}</td>
                    <td className="px-6 py-4">{course.studentsCount}</td>
                    <td className="px-6 py-4">${course.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {course.accessType === 'fixed_months' && course.accessMonths
                        ? `${course.accessMonths} months`
                        : 'Lifetime'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={course.status === 'published' ? 'success' : 'neutral'}>
                        {course.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        onClick={() => {
                          setEditingId(course.id);
                          setForm(toFormState(course));
                          setMessage(null);
                          setError(null);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
