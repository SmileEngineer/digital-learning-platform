'use client';

import { useEffect, useMemo, useState } from 'react';
import { PracticeExamCard } from '../components/PracticeExamCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/Button';
import { fetchCatalogItems, type CatalogItem } from '@/lib/platform-api';

export function PracticeExamsPage() {
  const [exams, setExams] = useState<CatalogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCatalogItems('practice_exam')
      .then((items) => {
        if (!cancelled) setExams(items);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load practice exams');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return exams;
    return exams.filter((exam) =>
      [exam.title, exam.description, exam.instructor].some((value) => value.toLowerCase().includes(q))
    );
  }, [exams, searchQuery]);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl mb-3">Practice Exams</h1>
          <p className="text-slate-600 text-lg">Test your knowledge and prepare for certifications</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search exams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <Button variant="outline">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Backend filters coming next
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-slate-600">{loading ? 'Loading exams...' : `${filtered.length} exams available`}</p>
        </div>

        {error && <p className="mb-6 text-sm text-red-600">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((exam) => (
            <PracticeExamCard key={exam.id} {...exam} />
          ))}
        </div>
      </div>
    </div>
  );
}
