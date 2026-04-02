'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { Calendar, Clock, User } from 'lucide-react';
import { fetchCatalogItem, type CatalogItem } from '@/lib/platform-api';

export function ArticleDetailPage() {
  const params = useParams<{ id: string }>();
  const slug = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [article, setArticle] = useState<CatalogItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetchCatalogItem(slug)
      .then((item) => {
        if (!cancelled) {
          setArticle(item);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load article.');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!article || error) {
    return (
      <div className="container mx-auto px-4 max-w-4xl py-12">
        <Card className="text-center py-12">
          <h1 className="text-2xl mb-2">Article unavailable</h1>
          <p className="text-slate-600">{error ?? 'This article could not be found.'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          {article.category && (
            <Badge variant="info" className="mb-3">
              {article.category}
            </Badge>
          )}
          <h1 className="text-4xl mb-4">{article.title}</h1>

          <div className="flex items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{article.instructor}</span>
            </div>
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

        <div className="mb-8">
          <img src={article.image} alt={article.title} className="w-full h-96 object-cover rounded-lg" />
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-700 mb-6">{article.description}</p>
          <h2 className="text-2xl mb-4 mt-8">Overview</h2>
          <p className="text-slate-700 mb-6">
            Articles are published as read-only educational posts. This item is now loaded from the shared
            platform catalog so the instructor can manage it alongside other content types.
          </p>
          <h2 className="text-2xl mb-4 mt-8">Why it matters</h2>
          <p className="text-slate-700 mb-6">
            The same content pipeline now powers courses, ebooks, live classes, exams, books, and articles,
            which keeps the public site and admin workflows aligned.
          </p>
        </div>
      </div>
    </div>
  );
}
