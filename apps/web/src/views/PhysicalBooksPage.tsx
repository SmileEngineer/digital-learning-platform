'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { fetchCatalogItems, type CatalogItem } from '@/lib/platform-api';

export function PhysicalBooksPage() {
  const [books, setBooks] = useState<CatalogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCatalogItems('physical_book')
      .then((items) => {
        if (!cancelled) {
          setBooks(items);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load books.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return books;
    return books.filter((book) =>
      [book.title, book.description, book.author ?? '', book.instructor].some((value) =>
        value.toLowerCase().includes(q)
      )
    );
  }, [books, searchQuery]);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl mb-3">Physical Bookstore</h1>
          <p className="text-slate-600 text-lg">Browse our collection of physical books with delivery validation.</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <Button variant="outline">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Delivery-ready catalog
            </Button>
          </div>
        </div>

        {error && <p className="mb-6 text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((book) => {
            const stock = book.stock ?? 0;
            return (
              <Link key={book.id} href={`/books/${book.slug}`} className="group">
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-64 bg-slate-100 flex items-center justify-center">
                    <img src={book.image} alt={book.title} className="h-full object-contain" />
                    {stock === 0 && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="error">Out of Stock</Badge>
                      </div>
                    )}
                    {stock > 0 && stock < 10 && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="warning">Only {stock} left</Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg mb-2 line-clamp-2">{book.title}</h3>
                    <p className="text-sm text-slate-600 mb-3">by {book.author ?? book.instructor}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl text-indigo-600">${book.price.toFixed(2)}</span>
                      <Button size="sm" disabled={stock === 0}>
                        {stock === 0 ? 'Sold Out' : 'Buy Now'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
