'use client';

import { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, RefreshCw } from 'lucide-react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { AdminNotice, AdminPageHeader, AdminSectionCard } from '@/components/AdminPageChrome';
import { useModuleCategories } from '@/contexts/SiteConfigContext';
import {
  createAdminPracticeExam,
  fetchAdminPracticeExam,
  fetchAdminPracticeExams,
  updateAdminPracticeExam,
  type AdminPracticeExam,
  type AdminPracticeExamInput,
} from '@/lib/platform-api';

type OptionFormState = {
  id: string;
  text: string;
  imageUrl: string;
};

type QuestionFormState = {
  type: 'multiple_choice' | 'single_select' | 'fill_blank';
  prompt: string;
  imageUrl: string;
  options: OptionFormState[];
  correctAnswersText: string;
  points: string;
};

type FormState = {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  price: string;
  instructorName: string;
  category: string;
  timeLimitMinutes: string;
  attemptsAllowed: string;
  passingScore: string;
  status: 'draft' | 'published';
  tagsText: string;
  questions: QuestionFormState[];
};

function emptyOption(index: number): OptionFormState {
  return {
    id: `option-${index + 1}`,
    text: '',
    imageUrl: '',
  };
}

function emptyQuestion(): QuestionFormState {
  return {
    type: 'single_select',
    prompt: '',
    imageUrl: '',
    options: [emptyOption(0), emptyOption(1)],
    correctAnswersText: '',
    points: '1',
  };
}

function createEmptyForm(defaultCategory = 'Practice Exams'): FormState {
  return {
    title: '',
    slug: '',
    description: '',
    imageUrl: '',
    price: '0',
    instructorName: '',
    category: defaultCategory,
    timeLimitMinutes: '60',
    attemptsAllowed: '3',
    passingScore: '70',
    status: 'published',
    tagsText: '',
    questions: [emptyQuestion()],
  };
}

function toFormState(item: AdminPracticeExam): FormState {
  return {
    title: item.title,
    slug: item.slug,
    description: item.description,
    imageUrl: item.image,
    price: String(item.price),
    instructorName: item.instructor,
    category: item.category ?? 'Practice Exams',
    timeLimitMinutes: String(item.timeLimitMinutes),
    attemptsAllowed: String(item.attemptsAllowed),
    passingScore: String(item.passingScore),
    status: item.status,
    tagsText: item.tags.join(', '),
    questions:
      item.questions.length > 0
        ? item.questions.map((question) => ({
            type: question.type,
            prompt: question.prompt,
            imageUrl: question.imageUrl ?? '',
            options:
              question.options.length > 0
                ? question.options.map((option) => ({
                    id: option.id,
                    text: option.text,
                    imageUrl: option.imageUrl ?? '',
                  }))
                : [emptyOption(0), emptyOption(1)],
            correctAnswersText: question.correctAnswers.join('\n'),
            points: String(question.points),
          }))
        : [emptyQuestion()],
  };
}

function toPayload(form: FormState): AdminPracticeExamInput {
  return {
    slug: form.slug.trim() || undefined,
    title: form.title.trim(),
    description: form.description.trim(),
    imageUrl: form.imageUrl.trim(),
    price: Number(form.price),
    instructorName: form.instructorName.trim(),
    category: form.category.trim(),
    timeLimitMinutes: Number(form.timeLimitMinutes),
    attemptsAllowed: Number(form.attemptsAllowed),
    passingScore: Number(form.passingScore),
    status: form.status,
    tags: form.tagsText
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
    questions: form.questions.map((question) => ({
      type: question.type,
      prompt: question.prompt.trim(),
      imageUrl: question.imageUrl.trim() || null,
      options:
        question.type === 'fill_blank'
          ? []
          : question.options.map((option, index) => ({
              id: option.id.trim() || `option-${index + 1}`,
              text: option.text.trim(),
              imageUrl: option.imageUrl.trim() || null,
            })),
      correctAnswers: question.correctAnswersText
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean),
      points: Number(question.points) || 1,
    })),
  };
}

export function ManagePracticeExamsPage() {
  const moduleCategories = useModuleCategories();
  const categoryOptions =
    moduleCategories.practiceExam.length > 0
      ? moduleCategories.practiceExam
      : ['Practice Exams'];
  const [items, setItems] = useState<AdminPracticeExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() =>
    createEmptyForm(categoryOptions[0] ?? 'Practice Exams')
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  async function loadItems() {
    try {
      setLoading(true);
      const data = await fetchAdminPracticeExams();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load practice exams.');
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
      const saved = editingId
        ? await updateAdminPracticeExam(editingId, payload)
        : await createAdminPracticeExam(payload);
      setItems((current) => {
        const next = current.filter((item) => item.id !== saved.id);
        return [saved, ...next];
      });
      setEditingId(saved.id);
      setForm(toFormState(saved));
      setEditorOpen(true);
      setMessage(editingId ? 'Practice exam updated successfully.' : 'Practice exam created successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save practice exam.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(id: string) {
    try {
      setLoadingDetailId(id);
      const item = await fetchAdminPracticeExam(id);
      setEditingId(item.id);
      setForm(toFormState(item));
      setEditorOpen(true);
      setMessage(`Editing "${item.title}"`);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load practice exam details.');
    } finally {
      setLoadingDetailId(null);
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(createEmptyForm(categoryOptions[0] ?? 'Practice Exams'));
    setMessage(null);
    setError(null);
    setEditorOpen(true);
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Manage Practice Exams"
        description="Organize exam setup, question banks, and security rules in a cleaner authoring experience."
        stats={[
          { label: 'Exams', value: String(orderedItems.length) },
          { label: 'Published', value: String(orderedItems.filter((item) => item.status === 'published').length), tone: 'success' },
          { label: 'Questions', value: String(orderedItems.reduce((sum, item) => sum + item.questions.length, 0)), tone: 'info' },
          { label: 'Editing', value: editingId ? '1 exam' : 'None', tone: editingId ? 'warning' : 'default' },
        ]}
        actions={
          <>
          <Button variant="outline" onClick={loadItems}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={resetForm}>
            <Plus className="w-4 h-4 mr-2" />
            Create Exam
          </Button>
          </>
        }
      />

      {message && <AdminNotice tone="success">{message}</AdminNotice>}
      {error && <AdminNotice tone="error">{error}</AdminNotice>}

      <div className={editorOpen ? 'grid gap-8 xl:grid-cols-[1.35fr,0.95fr]' : 'space-y-6'}>
        {editorOpen ? (
        <form onSubmit={handleSubmit}>
          <AdminSectionCard
            title={editingId ? 'Edit Practice Exam' : 'Create Practice Exam'}
            description="Open the editor only when you need to add or revise a practice exam."
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
                <span className="mb-2 block text-sm text-slate-700">Instructor</span>
                <input value={form.instructorName} onChange={(e) => setForm((c) => ({ ...c, instructorName: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
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
                <span className="mb-2 block text-sm text-slate-700">Time limit (minutes)</span>
                <input type="number" min="1" value={form.timeLimitMinutes} onChange={(e) => setForm((c) => ({ ...c, timeLimitMinutes: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Attempts allowed</span>
                <input type="number" min="1" value={form.attemptsAllowed} onChange={(e) => setForm((c) => ({ ...c, attemptsAllowed: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Passing score (%)</span>
                <input type="number" min="0" max="100" value={form.passingScore} onChange={(e) => setForm((c) => ({ ...c, passingScore: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Status</span>
                <select value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value as FormState['status'] }))} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-slate-700">Tags</span>
                <input value={form.tagsText} onChange={(e) => setForm((c) => ({ ...c, tagsText: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Certification Prep, Timed" />
              </label>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl">Exam Questions</h3>
                  <p className="text-sm text-slate-600">
                    Supported types: multiple choice, single selection, and fill in the blanks.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      questions: [...current.questions, emptyQuestion()],
                    }))
                  }
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>

              <div className="space-y-6">
                {form.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm uppercase tracking-wide text-slate-500">Question {questionIndex + 1}</h4>
                      {form.questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              questions: current.questions.filter((_, index) => index !== questionIndex),
                            }))
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4">
                      <label className="block">
                        <span className="mb-2 block text-sm text-slate-700">Question type</span>
                        <select
                          value={question.type}
                          onChange={(e) =>
                            setForm((current) => ({
                              ...current,
                              questions: current.questions.map((entry, index) =>
                                index === questionIndex
                                  ? {
                                      ...entry,
                                      type: e.target.value as QuestionFormState['type'],
                                      options:
                                        e.target.value === 'fill_blank' ? [] : entry.options.length > 0 ? entry.options : [emptyOption(0), emptyOption(1)],
                                    }
                                  : entry
                              ),
                            }))
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        >
                          <option value="single_select">Single Selection</option>
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="fill_blank">Fill in the Blanks</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm text-slate-700">Prompt</span>
                        <textarea
                          value={question.prompt}
                          onChange={(e) =>
                            setForm((current) => ({
                              ...current,
                              questions: current.questions.map((entry, index) =>
                                index === questionIndex ? { ...entry, prompt: e.target.value } : entry
                              ),
                            }))
                          }
                          rows={3}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                      </label>
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                          <span className="mb-2 block text-sm text-slate-700">Question image URL</span>
                          <input
                            value={question.imageUrl}
                            onChange={(e) =>
                              setForm((current) => ({
                                ...current,
                                questions: current.questions.map((entry, index) =>
                                  index === questionIndex ? { ...entry, imageUrl: e.target.value } : entry
                                ),
                              }))
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-sm text-slate-700">Points</span>
                          <input
                            type="number"
                            min="1"
                            value={question.points}
                            onChange={(e) =>
                              setForm((current) => ({
                                ...current,
                                questions: current.questions.map((entry, index) =>
                                  index === questionIndex ? { ...entry, points: e.target.value } : entry
                                ),
                              }))
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                          />
                        </label>
                      </div>

                      {question.type !== 'fill_blank' && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-medium text-slate-700">Answer options</h5>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setForm((current) => ({
                                  ...current,
                                  questions: current.questions.map((entry, index) =>
                                    index === questionIndex
                                      ? {
                                          ...entry,
                                          options: [...entry.options, emptyOption(entry.options.length)],
                                        }
                                      : entry
                                  ),
                                }))
                              }
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Option
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {question.options.map((option, optionIndex) => (
                              <div key={`${questionIndex}-${optionIndex}`} className="grid gap-3 md:grid-cols-[0.8fr,1.5fr,1.5fr,auto]">
                                <input
                                  value={option.id}
                                  onChange={(e) =>
                                    setForm((current) => ({
                                      ...current,
                                      questions: current.questions.map((entry, index) =>
                                        index === questionIndex
                                          ? {
                                              ...entry,
                                              options: entry.options.map((optionEntry, innerIndex) =>
                                                innerIndex === optionIndex ? { ...optionEntry, id: e.target.value } : optionEntry
                                              ),
                                            }
                                          : entry
                                      ),
                                    }))
                                  }
                                  placeholder="id"
                                  className="rounded-lg border border-slate-300 px-3 py-2"
                                />
                                <input
                                  value={option.text}
                                  onChange={(e) =>
                                    setForm((current) => ({
                                      ...current,
                                      questions: current.questions.map((entry, index) =>
                                        index === questionIndex
                                          ? {
                                              ...entry,
                                              options: entry.options.map((optionEntry, innerIndex) =>
                                                innerIndex === optionIndex ? { ...optionEntry, text: e.target.value } : optionEntry
                                              ),
                                            }
                                          : entry
                                      ),
                                    }))
                                  }
                                  placeholder="option text"
                                  className="rounded-lg border border-slate-300 px-3 py-2"
                                />
                                <input
                                  value={option.imageUrl}
                                  onChange={(e) =>
                                    setForm((current) => ({
                                      ...current,
                                      questions: current.questions.map((entry, index) =>
                                        index === questionIndex
                                          ? {
                                              ...entry,
                                              options: entry.options.map((optionEntry, innerIndex) =>
                                                innerIndex === optionIndex ? { ...optionEntry, imageUrl: e.target.value } : optionEntry
                                              ),
                                            }
                                          : entry
                                      ),
                                    }))
                                  }
                                  placeholder="option image URL"
                                  className="rounded-lg border border-slate-300 px-3 py-2"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setForm((current) => ({
                                      ...current,
                                      questions: current.questions.map((entry, index) =>
                                        index === questionIndex
                                          ? {
                                              ...entry,
                                              options: entry.options.filter((_, innerIndex) => innerIndex !== optionIndex),
                                            }
                                          : entry
                                      ),
                                    }))
                                  }
                                  disabled={question.options.length <= 2}
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <label className="block">
                        <span className="mb-2 block text-sm text-slate-700">
                          {question.type === 'fill_blank'
                            ? 'Accepted answers'
                            : 'Correct answer IDs'}
                        </span>
                        <textarea
                          value={question.correctAnswersText}
                          onChange={(e) =>
                            setForm((current) => ({
                              ...current,
                              questions: current.questions.map((entry, index) =>
                                index === questionIndex ? { ...entry, correctAnswersText: e.target.value } : entry
                              ),
                            }))
                          }
                          rows={3}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2"
                          placeholder={question.type === 'fill_blank' ? 'One accepted answer per line' : 'One option ID per line'}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : editingId ? 'Update Practice Exam' : 'Create Practice Exam'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset
              </Button>
            </div>
          </AdminSectionCard>
        </form>
        ) : null}

        <AdminSectionCard
          title="Exam Library"
          description="Review available tests first, then open the editor only when needed."
          className="xl:sticky xl:top-24 self-start"
        >
          <div className="space-y-4">
            {loading ? (
              <p className="text-slate-600">Loading practice exams…</p>
            ) : orderedItems.length === 0 ? (
              <p className="text-slate-600">No practice exams created yet.</p>
            ) : (
              orderedItems.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <Badge variant={item.status === 'published' ? 'success' : 'warning'}>{item.status}</Badge>
                        <Badge variant="info">{item.questions?.length ?? 0} questions</Badge>
                        <Badge variant="neutral">{item.attemptsAllowed} attempts</Badge>
                      </div>
                      <h3 className="text-lg">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.timeLimitMinutes} minutes • Pass at {item.passingScore}% • {item.attemptsTaken} attempt(s) taken
                      </p>
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
