'use client';

import { useEffect, useMemo, useState } from 'react';
import { LiveClassCard } from '../components/LiveClassCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/Button';
import { fetchCatalogItems, type CatalogItem } from '@/lib/platform-api';

export function LiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState<CatalogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCatalogItems('live_class')
      .then((items) => {
        if (!cancelled) setLiveClasses(items);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load live classes');
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
    if (!q) return liveClasses;
    return liveClasses.filter((item) =>
      [item.title, item.description, item.instructor].some((value) => value.toLowerCase().includes(q))
    );
  }, [liveClasses, searchQuery]);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl mb-3">Live Classes</h1>
          <p className="text-slate-600 text-lg">Join interactive live sessions with expert instructors</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search live classes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <Button variant="outline">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Scheduled Google Meet classes
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-slate-600">{loading ? 'Loading live classes...' : `${filtered.length} upcoming classes`}</p>
        </div>

        {error && <p className="mb-6 text-sm text-red-600">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((liveClass) => (
            <LiveClassCard key={liveClass.id} {...liveClass} />
          ))}
        </div>
      </div>
    </div>
  );
}
