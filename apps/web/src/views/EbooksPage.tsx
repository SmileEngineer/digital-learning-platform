'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EbookCard } from '../components/EbookCard';
import { CatalogFilterBanner } from '../components/CatalogFilterBanner';
import { RotateCcw, Search } from 'lucide-react';
import { Button } from '../components/Button';
import { fetchCatalogItems, type CatalogItem } from '@/lib/platform-api';
import {
  buildBrowseHref,
  createBrowseSelection,
  getSemesterOptions,
  getUniversityOptions,
  matchesBrowseSelection,
} from '@/lib/catalog-browse';

export function EbooksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ebooks, setEbooks] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const items = await fetchCatalogItems('ebook');
        if (!cancelled) {
          setEbooks(items);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load ebooks.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selection = useMemo(
    () =>
      createBrowseSelection(
        searchParams.get('state'),
        searchParams.get('university'),
        searchParams.get('semester')
      ),
    [searchParams]
  );

  const universityOptions = useMemo(() => getUniversityOptions(selection.state), [selection.state]);
  const semesterOptions = useMemo(() => getSemesterOptions(), []);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return ebooks
      .filter((ebook) => {
        const hasBrowseMetadata = Boolean(ebook.stateName || ebook.universityName || ebook.semesterLabel);
        const matchesBrowse = hasBrowseMetadata ? matchesBrowseSelection(ebook, selection) : true;
        const category = ebook.category ?? '';
        const author = ebook.author ?? ebook.instructor;
        const browseText = [ebook.stateName, ebook.universityName, ebook.semesterLabel].filter(Boolean).join(' ');
        const matchesQuery =
          !query ||
          ebook.title.toLowerCase().includes(query) ||
          ebook.description.toLowerCase().includes(query) ||
          author.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query) ||
          browseText.toLowerCase().includes(query);
        return matchesBrowse && matchesQuery;
      })
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  }, [ebooks, searchQuery, selection]);

  function updateSelection(next: Partial<typeof selection>) {
    router.push(
      buildBrowseHref('/ebooks', {
        ...selection,
        ...next,
      })
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <CatalogFilterBanner />
        <div className="mb-8">
          <h1 className="text-4xl mb-3">eBooks</h1>
          <p className="text-slate-600 text-lg">Browse digital reading materials by state, university, and semester.</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-8">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search ebooks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <select
                value={selection.university}
                onChange={(e) => updateSelection({ university: e.target.value, semester: '' })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">All Universities</option>
                {universityOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selection.semester}
                onChange={(e) => updateSelection({ semester: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">All Semesters</option>
                {semesterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push('/ebooks')}
              className="whitespace-nowrap"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-slate-600">{loading ? 'Loading ebooks…' : `${filtered.length} ebooks found`}</p>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-[24rem] rounded-lg border border-slate-200 bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-600">
            No ebooks matched your current search and filter settings.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((ebook) => (
              <EbookCard
                key={ebook.id}
                id={ebook.slug}
                title={ebook.title}
                description={ebook.description}
                coverImage={ebook.coverImage}
                price={ebook.price}
                pages={ebook.pages ?? 0}
                format={ebook.format}
                downloadAllowed={ebook.downloadAllowed}
                previewAvailable={ebook.previewAvailable}
                tags={ebook.tags}
                stateName={ebook.stateName}
                universityName={ebook.universityName}
                semesterLabel={ebook.semesterLabel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
