'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Eye, FileText } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { fetchLearnerLibrary, type LearnerLibraryItem } from '@/lib/platform-api';

export function MyEbooksPage() {
  const router = useRouter();
  const [ebooks, setEbooks] = useState<LearnerLibraryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLearnerLibrary('ebook')
      .then((items) => {
        if (!cancelled) {
          setEbooks(items);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load ebooks.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="text-3xl mb-8">My eBooks & PDFs</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-4">
        {ebooks.map((ebook) => (
          <Card key={ebook.slug} hover>
            <div className="flex items-center gap-4">
              <img src={ebook.image} alt={ebook.title} className="w-12 h-16 object-cover rounded" />
              <div className="flex-1">
                <h3 className="mb-1">{ebook.title}</h3>
                <div className="text-sm text-slate-600">
                  {ebook.pages ?? 0} pages • {ebook.format ?? 'PDF'} • {ebook.accessLabel}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" disabled={!ebook.downloadAllowed}>
                  <Download className="w-4 h-4 mr-2" />
                  {ebook.downloadAllowed ? 'Download' : 'Locked'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => router.push(`/ebooks/${ebook.slug}`)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Read
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {ebooks.length === 0 && !error && (
        <Card className="mt-6 text-center py-10 text-slate-600">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          No ebooks unlocked yet.
        </Card>
      )}
    </div>
  );
}
