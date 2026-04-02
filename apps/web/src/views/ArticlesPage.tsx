'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { fetchCatalogItems, type CatalogItem } from '@/lib/platform-api';

export function ArticlesPage() {
  const [articles, setArticles] = useState<CatalogItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCatalogItems('article')
      .then((items) => {
        if (!cancelled) {
          setArticles(items);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load articles.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl mb-3">Articles & Blog</h1>
          <p className="text-slate-600 text-lg">Read platform updates and read-only learning articles.</p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        {featured && (
          <Card className="mb-8" hover>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-slate-200 rounded-lg overflow-hidden">
                <img src={featured.image} alt={featured.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                <Badge variant="info" className="mb-3 w-fit">
                  Featured
                </Badge>
                <Link href={`/articles/${featured.slug}`}>
                  <h2 className="text-2xl mb-3 hover:text-indigo-600 transition-colors">{featured.title}</h2>
                </Link>
                <p className="text-slate-600 mb-4">{featured.description}</p>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  {featured.category && <Badge variant="neutral">{featured.category}</Badge>}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Published article</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Read only</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((article) => (
            <Link key={article.id} href={`/articles/${article.slug}`} className="group">
              <Card hover>
                <div className="h-48 bg-slate-200 rounded-lg overflow-hidden mb-4">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                {article.category && (
                  <Badge variant="neutral" className="mb-3">
                    {article.category}
                  </Badge>
                )}
                <h3 className="text-xl mb-2 group-hover:text-indigo-600 transition-colors">{article.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{article.description}</p>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Read article</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Read only</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
