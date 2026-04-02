'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { Calendar, Clock, User } from 'lucide-react';
import { fetchArticleDetail, type AdminArticle } from '@/lib/platform-api';

export function ArticleDetailPage() {
  const params = useParams<{ id: string }>();
  const slug = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [article, setArticle] = useState<AdminArticle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetchArticleDetail(slug)
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
              <span>
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Published article'}
              </span>
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
          {article.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-slate-700 mb-6 whitespace-pre-line">
              {paragraph}
            </p>
          ))}
          {article.videoLinks.length > 0 && (
            <>
              <h2 className="text-2xl mb-4 mt-8">Related Videos</h2>
              <ul>
                {article.videoLinks.map((link) => (
                  <li key={link}>
                    <a href={link} target="_blank" rel="noreferrer">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
