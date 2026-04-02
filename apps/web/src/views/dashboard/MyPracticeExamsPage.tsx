'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ClipboardList } from 'lucide-react';
import { fetchLearnerLibrary, type LearnerLibraryItem } from '@/lib/platform-api';

export function MyPracticeExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<LearnerLibraryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLearnerLibrary('practice_exam')
      .then((items) => {
        if (!cancelled) {
          setExams(items);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load exams.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="text-3xl mb-8">My Practice Exams</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-4">
        {exams.map((exam) => (
          <Card key={exam.slug} hover>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1">{exam.title}</h3>
                <div className="text-sm text-slate-600">
                  Attempts: {exam.remainingAttempts ?? exam.attemptsAllowed ?? 0}/{exam.attemptsAllowed ?? 0}
                  {exam.passingScore ? ` • Passing: ${exam.passingScore}%` : ''}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={exam.remainingAttempts && exam.remainingAttempts > 0 ? 'info' : 'success'}>
                  {exam.remainingAttempts && exam.remainingAttempts > 0 ? 'Available' : 'Used'}
                </Badge>
                <Button
                  size="sm"
                  onClick={() => router.push(`/practice-exams/${exam.slug}`)}
                >
                  {exam.remainingAttempts && exam.remainingAttempts > 0 ? 'Start Exam' : 'Review'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
