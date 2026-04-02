'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, Award, Clock, FileText, Shield } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { fetchCatalogItem, fetchLearnerAccess, type CatalogItem } from '@/lib/platform-api';

export function PracticeExamDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const slug = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    async function load() {
      const exam = await fetchCatalogItem(slug);
      const access = await fetchLearnerAccess(slug).catch(() => ({ hasAccess: false, access: null }));
      if (!cancelled) {
        setItem(exam);
        setHasAccess(access.hasAccess);
        setRemainingAttempts(access.access?.remainingAttempts ?? null);
      }
    }
    load().catch(() => {
      if (!cancelled) setItem(null);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="text-center py-12">
          <h1 className="text-2xl mb-2">Practice exam unavailable</h1>
          <p className="text-slate-600">This exam could not be found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
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
                    <strong>Timed run:</strong> auto-submit and attempt tracking can be tied to the remaining attempts in your entitlement.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                  <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <strong>Secure environment:</strong> this route is now connected to the live product catalog and purchase flow.
                  </div>
                </div>
              </div>
            </Card>

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
                <div className="text-3xl text-indigo-600 mb-4">${item.price.toFixed(2)}</div>

                <Button
                  fullWidth
                  size="lg"
                  className="mb-6"
                  onClick={() => router.push(hasAccess ? '/dashboard/practice-exams' : `/checkout?product=${item.slug}`)}
                >
                  {hasAccess ? 'Open Exam Access' : 'Purchase Exam'}
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
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
