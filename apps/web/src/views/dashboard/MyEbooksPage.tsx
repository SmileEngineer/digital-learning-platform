'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Eye, FileText } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { fetchLearnerLibrary, requestEbookDownload, type LearnerLibraryItem } from '@/lib/platform-api';
import { buildQrCodeDataUrl, createWatermarkedEbookHtml, triggerHtmlDownload } from '@/lib/ebook-reader';

export function MyEbooksPage() {
  const router = useRouter();
  const [ebooks, setEbooks] = useState<LearnerLibraryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [downloadingSlug, setDownloadingSlug] = useState<string | null>(null);

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

  async function handleDownload(slug: string) {
    try {
      setDownloadingSlug(slug);
      setError(null);
      const payload = await requestEbookDownload(slug);
      const message =
        payload.downloadConfirmationMessage ??
        'This eBook will be exported with your watermark on every page. Continue?';
      if (!window.confirm(message)) return;
      const qr = await buildQrCodeDataUrl(payload.qrValue);
      const html = createWatermarkedEbookHtml({
        title: payload.item.title,
        pages: payload.pages,
        watermarkText: payload.watermarkText,
        qrCodeDataUrl: qr,
      });
      triggerHtmlDownload(payload.filename, html);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not download ebook.');
    } finally {
      setDownloadingSlug(null);
    }
  }

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
                <Button
                  size="sm"
                  disabled={!ebook.downloadAllowed || downloadingSlug === ebook.slug}
                  onClick={() => handleDownload(ebook.slug)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {ebook.downloadAllowed
                    ? downloadingSlug === ebook.slug
                      ? 'Preparing…'
                      : 'Download'
                    : 'Locked'}
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
