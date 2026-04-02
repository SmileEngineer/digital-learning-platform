'use client';

import { useEffect, useMemo, useState } from 'react';
import { EbookCard } from '../components/EbookCard';
import { CatalogFilterBanner } from '../components/CatalogFilterBanner';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/Button';
import { fetchCatalogItems, type CatalogItem } from '@/lib/platform-api';

export function EbooksPage() {
  const [ebooks, setEbooks] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

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

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(ebooks.map((ebook) => ebook.category).filter(Boolean) as string[]))],
    [ebooks]
  );

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const results = ebooks.filter((ebook) => {
      const category = ebook.category ?? '';
      const matchesCategory =
        selectedCategory === 'All' || category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesQuery =
        !query ||
        ebook.title.toLowerCase().includes(query) ||
        ebook.description.toLowerCase().includes(query) ||
        ebook.instructor.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    return results.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.title.localeCompare(a.title);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'popular':
        default:
          return b.students - a.students;
      }
    });
  }, [ebooks, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <CatalogFilterBanner />
        <div className="mb-8">
          <h1 className="text-4xl mb-3">eBooks & PDFs</h1>
          <p className="text-slate-600 text-lg">Read online, unlock downloads, and preview pages before purchase.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
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
            <Button variant="outline">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
          
          <div className="flex gap-2 mt-4 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
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
            No ebooks matched your current filters.
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
