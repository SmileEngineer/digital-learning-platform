'use client';

import { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { AdminNotice, AdminPageHeader, AdminSectionCard } from '@/components/AdminPageChrome';
import { useAuth } from '@/contexts/AuthContext';
import { useModuleCategories } from '@/contexts/SiteConfigContext';
import { getSemesterOptions } from '@/lib/catalog-browse';
import { getStates, getUniversities, supportsSemesters } from '@/lib/navCatalog';
import {
  createAdminCourse,
  deleteAdminCourse,
  fetchAdminCourse,
  fetchAdminCourses,
  updateAdminCourse,
  type AdminCourse,
  type AdminCourseInput,
  type CourseSummary,
} from '@/lib/course-api';
import { formatRupees } from '@/lib/price';

type QuizOptionFormState = {
  id: string;
  text: string;
};

type QuizQuestionFormState = {
  prompt: string;
  correctOptionIdsText: string;
  options: QuizOptionFormState[];
};

type LectureFormState = {
  title: string;
  durationText: string;
  videoUrl: string;
  isPreview: boolean;
  quizTitle: string;
  quizQuestionCount: string;
  quizQuestions: QuizQuestionFormState[];
};

type SectionFormState = {
  title: string;
  quizTitle: string;
  quizQuestionCount: string;
  lectures: LectureFormState[];
};

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
  accessType: 'lifetime' | 'fixed_months' | 'fixed_date';
  accessMonths: string;
  accessFixedDate: string;
  status: 'draft' | 'published';
  learningPointsText: string;
  requirementsText: string;
  finalQuizTitle: string;
  finalQuizQuestionCount: string;
  sections: SectionFormState[];
};

function emptyQuizOption(index: number): QuizOptionFormState {
  return {
    id: `option-${index + 1}`,
    text: '',
  };
}

function emptyQuizQuestion(): QuizQuestionFormState {
  return {
    prompt: '',
    correctOptionIdsText: '',
    options: [emptyQuizOption(0), emptyQuizOption(1)],
  };
}

function emptyLecture(): LectureFormState {
  return {
    title: '',
    durationText: '',
    videoUrl: '',
    isPreview: false,
    quizTitle: '',
    quizQuestionCount: '0',
    quizQuestions: [],
  };
}

function emptySection(): SectionFormState {
  return {
    title: '',
    quizTitle: '',
    quizQuestionCount: '0',
    lectures: [emptyLecture()],
  };
}

function createEmptyForm(defaultCategory = ''): FormState {
  return {
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    instructorName: '',
    imageUrl: '',
    category: defaultCategory,
    stateName: '',
    universityName: '',
    semesterLabel: '',
    price: '0',
    durationText: '',
    tag: '',
    accessType: 'lifetime',
    accessMonths: '',
    accessFixedDate: '',
    status: 'published',
    learningPointsText: '',
    requirementsText: '',
    finalQuizTitle: '',
    finalQuizQuestionCount: '0',
    sections: [emptySection()],
  };
}

function toFormState(course: AdminCourse): FormState {
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
    accessType: course.accessType,
    accessMonths: course.accessMonths ? String(course.accessMonths) : '',
    accessFixedDate: course.accessFixedDate ? course.accessFixedDate.slice(0, 10) : '',
    status: course.status,
    learningPointsText: course.learningPoints.join('\n'),
    requirementsText: course.requirements.join('\n'),
    finalQuizTitle: course.finalQuizTitle ?? '',
    finalQuizQuestionCount: String(course.finalQuizQuestionCount),
    sections:
      course.sections.length > 0
        ? course.sections.map((section) => ({
            title: section.title,
            quizTitle: section.quizTitle ?? '',
            quizQuestionCount: String(section.quizQuestionCount),
            lectures:
              section.lectures.length > 0
                ? section.lectures.map((lecture) => ({
                    title: lecture.title,
                    durationText: lecture.durationText,
                    videoUrl: lecture.videoUrl ?? '',
                    isPreview: lecture.isPreview,
                    quizTitle: lecture.quizTitle ?? '',
                    quizQuestionCount: String(lecture.quizQuestionCount),
                    quizQuestions:
                      lecture.quizQuestions?.map((question) => ({
                        prompt: question.prompt,
                        correctOptionIdsText: question.correctOptionIds.join('\n'),
                        options:
                          question.options.length > 0
                            ? question.options.map((option) => ({
                                id: option.id,
                                text: option.text,
                              }))
                            : [emptyQuizOption(0), emptyQuizOption(1)],
                      })) ?? [],
                  }))
                : [emptyLecture()],
          }))
        : [emptySection()],
  };
}

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitCorrectOptionIds(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
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
    accessType: form.accessType,
    accessMonths: form.accessType === 'fixed_months' ? Number(form.accessMonths) || null : null,
    accessFixedDate: form.accessType === 'fixed_date' ? form.accessFixedDate || null : null,
    status: form.status,
    learningPoints: splitLines(form.learningPointsText),
    requirements: splitLines(form.requirementsText),
    finalQuizTitle: form.finalQuizTitle.trim() || null,
    finalQuizQuestionCount: Number(form.finalQuizQuestionCount) || 0,
    sections: form.sections.map((section) => ({
      title: section.title.trim(),
      quizTitle: section.quizTitle.trim() || null,
      quizQuestionCount: Number(section.quizQuestionCount) || 0,
      lectures: section.lectures.map((lecture) => ({
        title: lecture.title.trim(),
        durationText: lecture.durationText.trim(),
        videoUrl: lecture.videoUrl.trim() || null,
        isPreview: lecture.isPreview,
        quizTitle: lecture.quizTitle.trim() || null,
        quizQuestionCount:
          lecture.quizQuestions.length > 0
            ? lecture.quizQuestions.filter(
                (question) =>
                  question.prompt.trim() &&
                  question.options.filter((option) => option.text.trim()).length >= 2 &&
                  splitCorrectOptionIds(question.correctOptionIdsText).length > 0
              ).length
            : Number(lecture.quizQuestionCount) || 0,
        quizQuestions: lecture.quizQuestions
          .map((question) => ({
            prompt: question.prompt.trim(),
            options: question.options
              .map((option, index) => ({
                id: option.id.trim() || `option-${index + 1}`,
                text: option.text.trim(),
              }))
              .filter((option) => option.text),
            correctOptionIds: splitCorrectOptionIds(question.correctOptionIdsText),
          }))
          .filter(
            (question) =>
              question.prompt &&
              question.options.length >= 2 &&
              question.correctOptionIds.length > 0
          ),
      })),
    })),
  };
}

function accessSummary(course: CourseSummary): string {
  if (course.accessType === 'fixed_date' && course.accessFixedDate) {
    return `Until ${new Date(course.accessFixedDate).toLocaleDateString()}`;
  }
  if (course.accessType === 'fixed_months' && course.accessMonths) {
    return `${course.accessMonths} months`;
  }
  return 'Lifetime';
}

export function CourseManagementPage() {
  const { user } = useAuth();
  const moduleCategories = useModuleCategories();
  const categoryOptions = moduleCategories.course.length > 0 ? moduleCategories.course : ['LLB 3 YDC'];
  const stateOptions = getStates('/courses');
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => createEmptyForm(categoryOptions[0] ?? ''));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [showCreateSuccess, setShowCreateSuccess] = useState(false);
  const selectedState = stateOptions.find((state) => state.name === form.stateName);
  const universityOptions = selectedState ? getUniversities(selectedState.id, '/courses') : [];
  const selectedUniversity = universityOptions.find((item) => item.name === form.universityName);
  const shouldShowSemesters = Boolean(
    selectedState &&
      selectedUniversity &&
      supportsSemesters(selectedState.id, selectedUniversity.id, '/courses')
  );

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
    void loadCourses();
  }, []);

  useEffect(() => {
    if (!form.category && categoryOptions.length > 0) {
      setForm((current) => ({ ...current, category: categoryOptions[0] }));
    }
  }, [categoryOptions, form.category]);

  const sortedCourses = useMemo(
    () =>
      [...courses].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [courses]
  );

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sortedCourses;
    return sortedCourses.filter((course) =>
      [course.title, course.slug, course.category, course.status, course.instructorName]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [searchQuery, sortedCourses]);

  const libraryLectureCount = useMemo(
    () => sortedCourses.reduce((sum, course) => sum + course.totalLectures, 0),
    [sortedCourses]
  );

  const totalLectures = useMemo(
    () => form.sections.reduce((sum, section) => sum + section.lectures.length, 0),
    [form.sections]
  );

  const previewLectureCount = useMemo(
    () =>
      form.sections.reduce(
        (sum, section) => sum + section.lectures.filter((lecture) => lecture.isPreview).length,
        0
      ),
    [form.sections]
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
      setEditorOpen(true);
      if (editingId) {
        setMessage('Course updated successfully.');
      } else {
        setShowCreateSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save course.');
    } finally {
      setSubmitting(false);
    }
  }

  function beginCreate() {
    setEditingId(null);
    setForm(createEmptyForm(categoryOptions[0] ?? ''));
    setMessage(null);
    setError(null);
    setEditorOpen(true);
  }

  async function beginEdit(courseId: string) {
    try {
      setLoadingDetailId(courseId);
      setMessage(null);
      setError(null);
      const course = await fetchAdminCourse(courseId);
      setEditingId(course.id);
      setForm(toFormState(course));
      setEditorOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load course details.');
    } finally {
      setLoadingDetailId(null);
    }
  }

  async function handleDelete(course: CourseSummary) {
    if (user?.role !== 'super_admin') return;
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;

    try {
      setError(null);
      setMessage(null);
      await deleteAdminCourse(course.id);
      setCourses((current) => current.filter((item) => item.id !== course.id));
      if (editingId === course.id) {
        setEditingId(null);
        setEditorOpen(false);
        setForm(createEmptyForm(categoryOptions[0] ?? ''));
      }
      setMessage('Course deleted successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete course.');
    }
  }

  function updateSection(index: number, next: SectionFormState) {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) => (sectionIndex === index ? next : section)),
    }));
  }

  return (
    <div>
      <AdminPageHeader
        title="Manage Courses"
        description="Review the published and draft list first, then open the editor only when you need to create or revise a course."
        stats={[
          { label: 'Courses', value: String(sortedCourses.length) },
          {
            label: 'Published',
            value: String(sortedCourses.filter((course) => course.status === 'published').length),
            tone: 'success',
          },
          {
            label: 'Drafts',
            value: String(sortedCourses.filter((course) => course.status === 'draft').length),
            tone: 'warning',
          },
          { label: 'Lectures', value: String(libraryLectureCount), tone: 'info' },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => void loadCourses()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={beginCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </>
        }
      />

      <div className="mt-8 space-y-8">
      {message && <AdminNotice tone="success">{message}</AdminNotice>}
      {error && <AdminNotice tone="error">{error}</AdminNotice>}
      {editorOpen && <AdminSectionCard
        title={editingId ? 'Edit Course' : 'Create Course'}
        description="Use dropdowns for category and academic structure, then build sections, lectures, and quiz details in one editor."
        badge={
          <Button variant="ghost" onClick={() => setEditorOpen(false)}>
            <X className="w-4 h-4 mr-2" />
            Close Editor
          </Button>
        }
      >
        <div className="mb-4 flex flex-wrap gap-3 text-sm text-slate-600">
          <span>{totalLectures} total lectures</span>
          <span>|</span>
          <span>{previewLectureCount} preview lectures</span>
        </div>

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
              <span className="mb-2 block text-sm text-slate-700">Course Category</span>
              <select
                value={form.category}
                onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                required
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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
              <select
                value={form.stateName}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    stateName: e.target.value,
                    universityName: '',
                    semesterLabel: '',
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              >
                <option value="">Select state</option>
                {stateOptions.map((state) => (
                  <option key={state.id} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">University</span>
              <select
                value={form.universityName}
                onChange={(e) =>
                  setForm((current) => {
                    const nextUniversityName = e.target.value;
                    const nextUniversity = universityOptions.find(
                      (university) => university.name === nextUniversityName
                    );
                    const nextSupportsSemesters = Boolean(
                      selectedState &&
                        nextUniversity &&
                        supportsSemesters(selectedState.id, nextUniversity.id, '/courses')
                    );

                    return {
                      ...current,
                      universityName: nextUniversityName,
                      semesterLabel:
                        nextUniversityName && nextSupportsSemesters ? current.semesterLabel : '',
                    };
                  })
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                disabled={!selectedState}
              >
                <option value="">Select university</option>
                {universityOptions.map((university) => (
                  <option key={university.id} value={university.name}>
                    {university.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Semester</span>
              <select
                value={form.semesterLabel}
                onChange={(e) =>
                  setForm((current) => ({ ...current, semesterLabel: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                disabled={!shouldShowSemesters}
              >
                <option value="">{shouldShowSemesters ? 'Select semester' : 'Not required'}</option>
                {getSemesterOptions().map((semester) => (
                  <option key={semester.value} value={semester.label}>
                    {semester.label}
                  </option>
                ))}
              </select>
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
                    accessMonths: e.target.value === 'fixed_months' ? current.accessMonths : '',
                    accessFixedDate: e.target.value === 'fixed_date' ? current.accessFixedDate : '',
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              >
                <option value="lifetime">Lifetime</option>
                <option value="fixed_months">Fixed months</option>
                <option value="fixed_date">Fixed date</option>
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
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Access expiry date</span>
              <input
                type="date"
                value={form.accessFixedDate}
                onChange={(e) =>
                  setForm((current) => ({ ...current, accessFixedDate: e.target.value }))
                }
                disabled={form.accessType !== 'fixed_date'}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 disabled:bg-slate-100"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Final quiz title</span>
              <input
                value={form.finalQuizTitle}
                onChange={(e) =>
                  setForm((current) => ({ ...current, finalQuizTitle: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="Optional"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-700">Final quiz question count</span>
              <input
                type="number"
                min="0"
                value={form.finalQuizQuestionCount}
                onChange={(e) =>
                  setForm((current) => ({ ...current, finalQuizQuestionCount: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
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

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg">Curriculum</h3>
                <p className="text-sm text-slate-500">
                  Add sections, lectures, preview flags, lecture video URLs, and quiz metadata.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    sections: [...current.sections, emptySection()],
                  }))
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </div>

            <div className="space-y-6">
              {form.sections.map((section, sectionIndex) => (
                <details key={`section-${sectionIndex}`} className="rounded-lg border border-slate-200 bg-slate-50">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-900">
                    Section {sectionIndex + 1}: {section.title || 'Untitled section'}
                  </summary>
                  <div className="border-t border-slate-200 bg-white p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-base">Section {sectionIndex + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          sections:
                            current.sections.length === 1
                              ? [emptySection()]
                              : current.sections.filter((_, index) => index !== sectionIndex),
                        }))
                      }
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Section
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-700">Section title</span>
                      <input
                        value={section.title}
                        onChange={(e) =>
                          updateSection(sectionIndex, { ...section, title: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 px-4 py-2"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-700">Section quiz title</span>
                      <input
                        value={section.quizTitle}
                        onChange={(e) =>
                          updateSection(sectionIndex, { ...section, quizTitle: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 px-4 py-2"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-700">Section quiz questions</span>
                      <input
                        type="number"
                        min="0"
                        value={section.quizQuestionCount}
                        onChange={(e) =>
                          updateSection(sectionIndex, {
                            ...section,
                            quizQuestionCount: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 px-4 py-2"
                      />
                    </label>
                  </div>

                  <div className="space-y-4">
                    {section.lectures.map((lecture, lectureIndex) => (
                      <details
                        key={`lecture-${lectureIndex}`}
                        className="rounded-lg border border-slate-200 bg-slate-50"
                      >
                        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-900">
                          Lecture {lectureIndex + 1}: {lecture.title || 'Untitled lecture'}
                        </summary>
                        <div className="border-t border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h5 className="text-sm font-medium text-slate-700">
                            Lecture {lectureIndex + 1}
                          </h5>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              updateSection(sectionIndex, {
                                ...section,
                                lectures:
                                  section.lectures.length === 1
                                    ? [emptyLecture()]
                                    : section.lectures.filter((_, index) => index !== lectureIndex),
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Lecture
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="block">
                            <span className="mb-2 block text-sm text-slate-700">Lecture title</span>
                            <input
                              value={lecture.title}
                              onChange={(e) =>
                                updateSection(sectionIndex, {
                                  ...section,
                                  lectures: section.lectures.map((item, index) =>
                                    index === lectureIndex ? { ...item, title: e.target.value } : item
                                  ),
                                })
                              }
                              className="w-full rounded-lg border border-slate-300 px-4 py-2"
                              required
                            />
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-sm text-slate-700">Duration</span>
                            <input
                              value={lecture.durationText}
                              onChange={(e) =>
                                updateSection(sectionIndex, {
                                  ...section,
                                  lectures: section.lectures.map((item, index) =>
                                    index === lectureIndex
                                      ? { ...item, durationText: e.target.value }
                                      : item
                                  ),
                                })
                              }
                              className="w-full rounded-lg border border-slate-300 px-4 py-2"
                              placeholder="12:30"
                              required
                            />
                          </label>
                          <label className="block md:col-span-2">
                            <span className="mb-2 block text-sm text-slate-700">Video URL / Embed URL</span>
                            <input
                              value={lecture.videoUrl}
                              onChange={(e) =>
                                updateSection(sectionIndex, {
                                  ...section,
                                  lectures: section.lectures.map((item, index) =>
                                    index === lectureIndex ? { ...item, videoUrl: e.target.value } : item
                                  ),
                                })
                              }
                              className="w-full rounded-lg border border-slate-300 px-4 py-2"
                              placeholder="https://www.youtube.com/embed/..."
                            />
                          </label>
                          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
                            <input
                              type="checkbox"
                              checked={lecture.isPreview}
                              onChange={(e) =>
                                updateSection(sectionIndex, {
                                  ...section,
                                  lectures: section.lectures.map((item, index) =>
                                    index === lectureIndex ? { ...item, isPreview: e.target.checked } : item
                                  ),
                                })
                              }
                            />
                            <span className="text-sm text-slate-700">Mark this lecture as preview</span>
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-sm text-slate-700">Lecture quiz title</span>
                            <input
                              value={lecture.quizTitle}
                              onChange={(e) =>
                                updateSection(sectionIndex, {
                                  ...section,
                                  lectures: section.lectures.map((item, index) =>
                                    index === lectureIndex ? { ...item, quizTitle: e.target.value } : item
                                  ),
                                })
                              }
                              className="w-full rounded-lg border border-slate-300 px-4 py-2"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-sm text-slate-700">Lecture quiz questions</span>
                            <input
                              type="number"
                              min="0"
                              value={lecture.quizQuestionCount}
                              onChange={(e) =>
                                updateSection(sectionIndex, {
                                  ...section,
                                  lectures: section.lectures.map((item, index) =>
                                    index === lectureIndex
                                      ? { ...item, quizQuestionCount: e.target.value }
                                      : item
                                  ),
                                })
                              }
                              className="w-full rounded-lg border border-slate-300 px-4 py-2"
                            />
                          </label>
                        </div>
                        <div className="mt-4 rounded-lg border border-slate-200 p-4">
                          <div className="mb-4 flex items-center justify-between">
                            <div>
                              <h6 className="text-sm font-semibold text-slate-900">Lecture Quiz Builder</h6>
                              <p className="mt-1 text-xs text-slate-600">
                                Add quiz prompts, options, and correct option IDs for this lecture.
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateSection(sectionIndex, {
                                  ...section,
                                  lectures: section.lectures.map((item, index) =>
                                    index === lectureIndex
                                      ? { ...item, quizQuestions: [...item.quizQuestions, emptyQuizQuestion()] }
                                      : item
                                  ),
                                })
                              }
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Question
                            </Button>
                          </div>

                          {lecture.quizQuestions.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-500">
                              No quiz questions added yet.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {lecture.quizQuestions.map((question, questionIndex) => (
                                <div
                                  key={`lecture-${lectureIndex}-question-${questionIndex}`}
                                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                                >
                                  <div className="mb-3 flex items-center justify-between">
                                    <h6 className="text-sm font-medium text-slate-900">
                                      Question {questionIndex + 1}
                                    </h6>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="text-red-600 hover:bg-red-50"
                                      onClick={() =>
                                        updateSection(sectionIndex, {
                                          ...section,
                                          lectures: section.lectures.map((item, index) =>
                                            index === lectureIndex
                                              ? {
                                                  ...item,
                                                  quizQuestions: item.quizQuestions.filter(
                                                    (_, innerIndex) => innerIndex !== questionIndex
                                                  ),
                                                }
                                              : item
                                          ),
                                        })
                                      }
                                    >
                                      Remove
                                    </Button>
                                  </div>

                                  <div className="space-y-4">
                                    <label className="block">
                                      <span className="mb-2 block text-sm text-slate-700">Prompt</span>
                                      <textarea
                                        value={question.prompt}
                                        onChange={(e) =>
                                          updateSection(sectionIndex, {
                                            ...section,
                                            lectures: section.lectures.map((item, index) =>
                                              index === lectureIndex
                                                ? {
                                                    ...item,
                                                    quizQuestions: item.quizQuestions.map((entry, innerIndex) =>
                                                      innerIndex === questionIndex
                                                        ? { ...entry, prompt: e.target.value }
                                                        : entry
                                                    ),
                                                  }
                                                : item
                                            ),
                                          })
                                        }
                                        rows={3}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2"
                                      />
                                    </label>

                                    <div className="space-y-3">
                                      {question.options.map((option, optionIndex) => (
                                        <div
                                          key={`question-${questionIndex}-option-${optionIndex}`}
                                          className="grid gap-3 md:grid-cols-[0.8fr,1.8fr,auto]"
                                        >
                                          <input
                                            value={option.id}
                                            onChange={(e) =>
                                              updateSection(sectionIndex, {
                                                ...section,
                                                lectures: section.lectures.map((item, index) =>
                                                  index === lectureIndex
                                                    ? {
                                                        ...item,
                                                        quizQuestions: item.quizQuestions.map((entry, innerIndex) =>
                                                          innerIndex === questionIndex
                                                            ? {
                                                                ...entry,
                                                                options: entry.options.map((optionItem, optionInnerIndex) =>
                                                                  optionInnerIndex === optionIndex
                                                                    ? { ...optionItem, id: e.target.value }
                                                                    : optionItem
                                                                ),
                                                              }
                                                            : entry
                                                        ),
                                                      }
                                                    : item
                                                ),
                                              })
                                            }
                                            className="rounded-lg border border-slate-300 px-3 py-2"
                                            placeholder="option-id"
                                          />
                                          <input
                                            value={option.text}
                                            onChange={(e) =>
                                              updateSection(sectionIndex, {
                                                ...section,
                                                lectures: section.lectures.map((item, index) =>
                                                  index === lectureIndex
                                                    ? {
                                                        ...item,
                                                        quizQuestions: item.quizQuestions.map((entry, innerIndex) =>
                                                          innerIndex === questionIndex
                                                            ? {
                                                                ...entry,
                                                                options: entry.options.map((optionItem, optionInnerIndex) =>
                                                                  optionInnerIndex === optionIndex
                                                                    ? { ...optionItem, text: e.target.value }
                                                                    : optionItem
                                                                ),
                                                              }
                                                            : entry
                                                        ),
                                                      }
                                                    : item
                                                ),
                                              })
                                            }
                                            className="rounded-lg border border-slate-300 px-3 py-2"
                                            placeholder="Option text"
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() =>
                                              updateSection(sectionIndex, {
                                                ...section,
                                                lectures: section.lectures.map((item, index) =>
                                                  index === lectureIndex
                                                    ? {
                                                        ...item,
                                                        quizQuestions: item.quizQuestions.map((entry, innerIndex) =>
                                                          innerIndex === questionIndex
                                                            ? {
                                                                ...entry,
                                                                options:
                                                                  entry.options.length <= 2
                                                                    ? entry.options
                                                                    : entry.options.filter(
                                                                        (_, optionInnerIndex) => optionInnerIndex !== optionIndex
                                                                      ),
                                                              }
                                                            : entry
                                                        ),
                                                      }
                                                    : item
                                                ),
                                              })
                                            }
                                            disabled={question.options.length <= 2}
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      ))}
                                    </div>

                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        updateSection(sectionIndex, {
                                          ...section,
                                          lectures: section.lectures.map((item, index) =>
                                            index === lectureIndex
                                              ? {
                                                  ...item,
                                                  quizQuestions: item.quizQuestions.map((entry, innerIndex) =>
                                                    innerIndex === questionIndex
                                                      ? {
                                                          ...entry,
                                                          options: [
                                                            ...entry.options,
                                                            emptyQuizOption(entry.options.length),
                                                          ],
                                                        }
                                                      : entry
                                                  ),
                                                }
                                              : item
                                          ),
                                        })
                                      }
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Option
                                    </Button>

                                    <label className="block">
                                      <span className="mb-2 block text-sm text-slate-700">Correct option IDs</span>
                                      <textarea
                                        value={question.correctOptionIdsText}
                                        onChange={(e) =>
                                          updateSection(sectionIndex, {
                                            ...section,
                                            lectures: section.lectures.map((item, index) =>
                                              index === lectureIndex
                                                ? {
                                                    ...item,
                                                    quizQuestions: item.quizQuestions.map((entry, innerIndex) =>
                                                      innerIndex === questionIndex
                                                        ? { ...entry, correctOptionIdsText: e.target.value }
                                                        : entry
                                                    ),
                                                  }
                                                : item
                                            ),
                                          })
                                        }
                                        rows={3}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2"
                                        placeholder="One option ID per line"
                                      />
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        </div>
                      </details>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        updateSection(sectionIndex, {
                          ...section,
                          lectures: [...section.lectures, emptyLecture()],
                        })
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lecture
                    </Button>
                  </div>
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Update Course' : 'Create Course'}
            </Button>
            <Button type="button" variant="outline" onClick={beginCreate}>
              Reset
            </Button>
          </div>
        </form>
      </AdminSectionCard>}

      <AdminSectionCard
        title="Course Library"
        description="Search the current course list, then open any course to edit or remove it."
        className="overflow-hidden"
      >
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3"
              placeholder="Search courses"
            />
          </div>
          <div className="text-sm text-slate-600">
            {filteredCourses.length} result{filteredCourses.length === 1 ? '' : 's'}
          </div>
        </div>
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
                    Preparing course list...
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    No courses matched the current search.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b border-slate-200 last:border-0">
                    <td className="px-6 py-4">
                      <div>
                        <div>{course.title}</div>
                        <div className="text-xs text-slate-500 mt-1">/{course.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{course.category}</td>
                    <td className="px-6 py-4">{course.studentsCount}</td>
                    <td className="px-6 py-4">{formatRupees(course.price)}</td>
                    <td className="px-6 py-4">{accessSummary(course)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={course.status === 'published' ? 'success' : 'neutral'}>
                        {course.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => void beginEdit(course.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        {loadingDetailId === course.id ? 'Loading...' : 'Edit'}
                        </Button>
                        {user?.role === 'super_admin' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => void handleDelete(course)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminSectionCard>
      </div>

      {showCreateSuccess ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900">Course created successfully</h2>
            <p className="mt-2 text-sm text-slate-600">
              The course is saved and available in the course library.
            </p>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowCreateSuccess(false)}>Continue</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
