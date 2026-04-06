'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, Award, Clock, FileText, Shield } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchCatalogItem,
  fetchLearnerAccess,
  fetchPracticeExamHistory,
  startPracticeExam,
  submitPracticeExam,
  type CatalogItem,
  type LearnerPracticeExamHistory,
  type LearnerPracticeExamSession,
  type PracticeExamResult,
} from '@/lib/platform-api';
import { formatRupees } from '@/lib/price';

export function PracticeExamDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const slug = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [history, setHistory] = useState<LearnerPracticeExamHistory | null>(null);
  const [session, setSession] = useState<LearnerPracticeExamSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [result, setResult] = useState<PracticeExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [nowTick, setNowTick] = useState(Date.now());
  const autoSubmitRef = useRef(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const exam = await fetchCatalogItem(slug);
        const access = user
          ? await fetchLearnerAccess(slug).catch(() => ({ hasAccess: false, access: null }))
          : { hasAccess: false, access: null };
        const examHistory = user && access.hasAccess ? await fetchPracticeExamHistory(slug).catch(() => null) : null;

        if (!cancelled) {
          setItem(exam);
          setHasAccess(access.hasAccess);
          setRemainingAttempts(access.access?.remainingAttempts ?? examHistory?.remainingAttempts ?? null);
          setHistory(examHistory);
          setResult(null);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load practice exam.');
          setItem(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load().catch(() => {
      if (!cancelled) setItem(null);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, user]);

  useEffect(() => {
    if (!session?.security.disableRightClick) return;

    const blockContextMenu = (event: MouseEvent) => event.preventDefault();
    const blockShortcuts = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const ctrlLike = event.ctrlKey || event.metaKey;
      if (
        key === 'f12' ||
        (ctrlLike && event.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        (ctrlLike && ['u', 's', 'p'].includes(key))
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('contextmenu', blockContextMenu);
    window.addEventListener('keydown', blockShortcuts);
    return () => {
      window.removeEventListener('contextmenu', blockContextMenu);
      window.removeEventListener('keydown', blockShortcuts);
    };
  }, [session]);

  const secondsRemaining = useMemo(() => {
    if (!session) return null;
    const diff = Math.max(0, Math.floor((new Date(session.attempt.expiresAt).getTime() - nowTick) / 1000));
    return diff;
  }, [session, nowTick]);

  useEffect(() => {
    if (!session) return;
    if (autoSubmitRef.current) return;
    const interval = window.setInterval(() => {
      setNowTick(Date.now());
      const expiresAt = new Date(session.attempt.expiresAt).getTime();
      if (Date.now() >= expiresAt && !autoSubmitRef.current) {
        autoSubmitRef.current = true;
        void handleSubmit(true);
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [session]);

  async function refreshHistory() {
    if (!slug || !user || !hasAccess) return;
    const examHistory = await fetchPracticeExamHistory(slug);
    setHistory(examHistory);
    setRemainingAttempts(examHistory.remainingAttempts);
  }

  async function handleStart() {
    if (!slug) return;
    if (!user) {
      router.push(`/login?next=/practice-exams/${encodeURIComponent(slug)}`);
      return;
    }
    try {
      setStarting(true);
      const nextSession = await startPracticeExam(slug);
      setSession(nextSession);
      setAnswers((nextSession.attempt.answers as Record<string, unknown>) ?? {});
      setResult(null);
      setError(null);
      autoSubmitRef.current = false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start practice exam.');
    } finally {
      setStarting(false);
    }
  }

  async function handleSubmit(auto = false) {
    if (!slug || !session) return;
    try {
      setSubmitting(true);
      const response = await submitPracticeExam(slug, {
        attemptId: session.attempt.id,
        answers,
      });
      setResult(response.result);
      setSession(null);
      setError(null);
      await refreshHistory();
      if (auto) autoSubmitRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit practice exam.');
    } finally {
      setSubmitting(false);
    }
  }

  function setSingleAnswer(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function toggleMultiAnswer(questionId: string, value: string) {
    setAnswers((current) => {
      const existing = Array.isArray(current[questionId]) ? (current[questionId] as string[]) : [];
      return {
        ...current,
        [questionId]: existing.includes(value)
          ? existing.filter((entry) => entry !== value)
          : [...existing, value],
      };
    });
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-slate-600">Loading practice exam…</div>;
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="text-center py-12">
          <h1 className="text-2xl mb-2">Practice exam unavailable</h1>
          <p className="text-slate-600">{error ?? 'This exam could not be found.'}</p>
        </Card>
      </div>
    );
  }

  const timerLabel =
    secondsRemaining === null
      ? null
      : `${Math.floor(secondsRemaining / 60)
          .toString()
          .padStart(2, '0')}:${(secondsRemaining % 60).toString().padStart(2, '0')}`;

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Badge variant="info" className="mb-3">
                {item.tags[0] ?? 'Practice Exam'}
              </Badge>
              <h1 className="text-4xl mb-3">{item.title}</h1>
              <p className="text-lg text-slate-600 mb-4">{item.description}</p>
            </div>

            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Exam Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <div className="text-sm text-slate-600">Questions</div>
                    <div className="text-lg">{item.questions ?? 0} questions</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <div className="text-sm text-slate-600">Time Limit</div>
                    <div className="text-lg">{item.timeLimit ?? 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <div className="text-sm text-slate-600">Attempts</div>
                    <div className="text-lg">{item.attempts ?? 1} attempts</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <div className="text-sm text-slate-600">Passing Score</div>
                    <div className="text-lg">{item.passingScore ?? 0}%</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="mb-8">
              <h2 className="text-2xl mb-4">What&apos;s Included</h2>
              <div className="space-y-3">
                {[
                  `${item.questions ?? 0} practice questions`,
                  'Timed exam simulation mode',
                  'Attempts tracked through learner entitlements',
                  `${item.validityLabel ?? 'Entitlement-based access'}`,
                ].map((line) => (
                  <div key={line} className="flex gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span className="text-slate-700">{line}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Exam Rules & Guidelines</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <strong>Timed run:</strong> the exam auto-submits when the timer reaches zero.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                  <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <strong>Secure environment:</strong> right click and common inspect shortcuts are blocked during an active exam session.
                  </div>
                </div>
              </div>
            </Card>

            {session && (
              <Card className="mb-8">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl">Active Exam Attempt</h2>
                    <p className="text-sm text-slate-600">
                      Attempt {session.attempt.attemptNumber}. Correct answers will not be shown after submission.
                    </p>
                  </div>
                  <Badge variant={secondsRemaining !== null && secondsRemaining < 300 ? 'error' : 'info'}>
                    <Clock className="w-3 h-3 mr-1" />
                    {timerLabel ?? 'Timed'}
                  </Badge>
                </div>

                <div className="space-y-6 select-none">
                  {session.questions.map((question, index) => (
                    <div key={question.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <h3 className="text-lg">
                          Q{index + 1}. {question.prompt}
                        </h3>
                        <Badge variant="neutral">{question.points} pt</Badge>
                      </div>
                      {question.imageUrl && (
                        <img
                          src={question.imageUrl}
                          alt={`Question ${index + 1}`}
                          className="w-full max-h-56 object-cover rounded-lg border border-slate-200 mb-4"
                        />
                      )}
                      {question.type === 'fill_blank' ? (
                        <input
                          type="text"
                          value={typeof answers[question.id] === 'string' ? (answers[question.id] as string) : ''}
                          onChange={(e) => setSingleAnswer(question.id, e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-4 py-2"
                          placeholder="Type your answer"
                        />
                      ) : (
                        <div className="space-y-3">
                          {question.options.map((option) => {
                            const multiValues = Array.isArray(answers[question.id]) ? (answers[question.id] as string[]) : [];
                            const isChecked =
                              question.type === 'multiple_choice'
                                ? multiValues.includes(option.id)
                                : answers[question.id] === option.id;
                            return (
                              <label key={option.id} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                                <input
                                  type={question.type === 'multiple_choice' ? 'checkbox' : 'radio'}
                                  name={question.id}
                                  checked={isChecked}
                                  onChange={() =>
                                    question.type === 'multiple_choice'
                                      ? toggleMultiAnswer(question.id, option.id)
                                      : setSingleAnswer(question.id, option.id)
                                  }
                                />
                                <div className="flex-1">
                                  <div>{option.text}</div>
                                  {option.imageUrl && (
                                    <img
                                      src={option.imageUrl}
                                      alt={option.text}
                                      className="mt-3 w-full max-h-44 rounded-lg border border-slate-200 object-cover"
                                    />
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex gap-3">
                  <Button onClick={() => void handleSubmit(false)} disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit Exam'}
                  </Button>
                  <Button variant="outline" disabled>
                    Secure mode active
                  </Button>
                </div>
              </Card>
            )}

            {result && (
              <Card className="mb-8">
                <h2 className="text-2xl mb-4">Exam Result</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="text-sm text-slate-600">Score</div>
                    <div className="text-2xl">{result.score}/{result.totalPoints}</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="text-sm text-slate-600">Percentage</div>
                    <div className="text-2xl">{result.percentage}%</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="text-sm text-slate-600">Passing Score</div>
                    <div className="text-2xl">{result.passingScore}%</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="text-sm text-slate-600">Status</div>
                    <div className={`text-2xl ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {result.passed ? 'Pass' : 'Fail'}
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  Remaining attempts: {result.remainingAttempts ?? 0}
                  {result.certificateIssued ? ' • Certificate email issued.' : ''}
                  {result.autoSubmitted ? ' • Auto-submitted due to time expiry.' : ''}
                </div>
              </Card>
            )}

            {history && history.attempts.length > 0 && !session && (
              <Card className="mb-8">
                <h2 className="text-2xl mb-4">Attempt History</h2>
                <div className="space-y-3">
                  {history.attempts.map((attempt) => (
                    <div key={attempt.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="font-medium">Attempt {attempt.attemptNumber}</div>
                          <div className="text-sm text-slate-600">
                            {attempt.submittedAt
                              ? new Date(attempt.submittedAt).toLocaleString('en-US')
                              : 'In progress'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg">
                            {attempt.score}/{attempt.totalPoints} ({attempt.percentage}%)
                          </div>
                          <Badge variant={attempt.passed ? 'success' : attempt.status === 'in_progress' ? 'info' : 'warning'}>
                            {attempt.passed ? 'Pass' : attempt.status === 'in_progress' ? 'In Progress' : 'Fail'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card>
              <h2 className="text-2xl mb-4">Description</h2>
              <div className="prose prose-slate max-w-none text-slate-700">
                <p>{item.description}</p>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <div className="text-3xl text-indigo-600 mb-4">{formatRupees(item.price)}</div>

                <Button
                  fullWidth
                  size="lg"
                  className="mb-6"
                  onClick={() =>
                    hasAccess ? void handleStart() : router.push(`/checkout?product=${item.slug}`)
                  }
                  disabled={hasAccess ? starting || (remainingAttempts ?? 0) <= 0 : false}
                >
                  {hasAccess ? (starting ? 'Preparing Exam…' : 'Start Exam') : 'Purchase Exam'}
                </Button>

                <div className="space-y-3 border-t border-slate-200 pt-6">
                  <h3 className="mb-3">Exam Details:</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <span>{item.questions ?? 0} questions</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span>{item.timeLimit ?? 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <span>{remainingAttempts ?? item.attempts ?? 1} attempts remaining</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="w-5 h-5 text-slate-400" />
                    <span>{item.passingScore ?? 0}% passing score</span>
                  </div>
                </div>

                {hasAccess && (
                  <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    Immediate result and pass/fail status will be shown after submission. Correct answers stay hidden.
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
