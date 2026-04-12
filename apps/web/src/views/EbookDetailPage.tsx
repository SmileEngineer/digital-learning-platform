'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, Download, Eye, FileText, Shield, Smartphone } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchEbookPreview,
  fetchPurchasedEbookReader,
  requestEbookDownload,
  type CatalogItem,
  type EbookReaderData,
} from '@/lib/platform-api';
import { buildQrCodeDataUrl, createWatermarkedEbookHtml, triggerHtmlDownload } from '@/lib/ebook-reader';
import { formatRupees } from '@/lib/price';

export function EbookDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const slug = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [reader, setReader] = useState<EbookReaderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const preview = await fetchEbookPreview(slug);
        let nextReader = preview;

        if (user) {
          try {
            nextReader = await fetchPurchasedEbookReader(slug);
          } catch (purchaseErr) {
            if (!(purchaseErr instanceof Error) || !/purchase this ebook/i.test(purchaseErr.message)) {
              throw purchaseErr;
            }
          }
        }

        if (!cancelled) {
          setReader(nextReader);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load ebook details.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug, user]);

  useEffect(() => {
    let cancelled = false;
    buildQrCodeDataUrl(reader?.qrValue ?? null)
      .then((value) => {
        if (!cancelled) setQrCodeDataUrl(value);
      })
      .catch(() => {
        if (!cancelled) setQrCodeDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [reader?.qrValue]);

  useEffect(() => {
    if (!reader?.protection.disableRightClick) return;

    const blockContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    const blockShortcuts = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const ctrlLike = event.ctrlKey || event.metaKey;
      if (
        key === 'f12' ||
        (ctrlLike && event.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        (ctrlLike && ['u', 's', 'p'].includes(key))
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('contextmenu', blockContextMenu);
    window.addEventListener('keydown', blockShortcuts);
    return () => {
      window.removeEventListener('contextmenu', blockContextMenu);
      window.removeEventListener('keydown', blockShortcuts);
    };
  }, [reader?.protection.disableRightClick]);

  const item = reader?.item ?? null;
  const hasAccess = reader?.hasAccess ?? false;
  const previewCount = useMemo(
    () => Math.max(1, reader?.item.previewCount ?? reader?.pages.length ?? 1),
    [reader]
  );

  async function handleDownload() {
    if (!item) return;
    try {
      setDownloading(true);
      const payload = await requestEbookDownload(item.slug);
      const message =
        payload.downloadConfirmationMessage ??
        'This eBook will be exported with your watermark on every page. Continue?';
      if (!window.confirm(message)) return;
      if (payload.pdfUrl) {
        window.open(payload.pdfUrl, '_blank', 'noopener,noreferrer');
        return;
      }
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
      setDownloading(false);
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-slate-600">Loading ebook...</div>;
  }

  if (!reader || !item || error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="text-center py-12">
          <h1 className="text-2xl mb-2">eBook unavailable</h1>
          <p className="text-slate-600">{error ?? 'This ebook could not be found.'}</p>
        </Card>
      </div>
    );
  }

  const activeReader = reader;

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex gap-2 mb-3 flex-wrap">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="new">
                    {tag}
                  </Badge>
                ))}
                <Badge variant={item.downloadAllowed ? 'success' : 'warning'}>
                  {item.downloadAllowed ? 'Downloadable' : 'Read Only'}
                </Badge>
              </div>
              <h1 className="text-4xl mb-3">{item.title}</h1>
              <p className="text-lg text-slate-600 mb-4">{item.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>{item.pages ?? 0} pages</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  <span>{item.format ?? 'PDF'} format</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <img
                src={item.coverImage}
                alt={item.title}
                className="w-full max-w-md mx-auto object-contain rounded-lg shadow-lg"
              />
            </div>

            <Card className="mb-8">
              <h2 className="text-2xl mb-4">What&apos;s Inside</h2>
              <div className="space-y-3">
                {(activeReader.pages.length > 0
                  ? activeReader.pages.map((entry) => entry.title)
                  : ['Preview pages', 'Secure reader access', 'Watermarked entitlement-based access']
                ).map((line, index) => (
                  <div key={`${line}-${index}`} className="flex gap-3">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-600 text-sm">{index + 1}</span>
                    </div>
                    <span className="text-slate-700">{line}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Description</h2>
              <div className="prose prose-slate max-w-none text-slate-700">
                <p>{item.description}</p>
                <p>
                  Purchased readers receive full-page access with watermark protection, preview gating,
                  and account-linked access checks before content is unlocked.
                </p>
              </div>
            </Card>

            <Card className="mb-8">
              <div className="flex items-center justify-between mb-4 gap-3">
                <h2 className="text-2xl">{hasAccess ? 'Watermarked Reader' : 'Preview Pages'}</h2>
                <Badge variant={hasAccess ? 'success' : 'warning'}>
                  {hasAccess ? 'Purchased access' : `${previewCount} preview page${previewCount === 1 ? '' : 's'}`}
                </Badge>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 select-none">
                {activeReader.pages.map((page) => (
                  <div
                    key={page.pageNumber}
                    className="relative min-h-[30rem] rounded border border-slate-200 bg-white p-5 overflow-hidden shadow-sm"
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] rotate-[-28deg] text-3xl font-black text-slate-500 pointer-events-none">
                      {activeReader.watermarkText}
                    </div>
                    {qrCodeDataUrl && (
                      <img
                        src={qrCodeDataUrl}
                        alt="Reader QR watermark"
                        className="absolute bottom-4 right-4 w-20 h-20 opacity-90"
                      />
                    )}
                    <div className="relative z-10 flex h-full flex-col">
                      <div className="text-xs uppercase tracking-wide text-indigo-600 mb-3">
                        Page {page.pageNumber}
                      </div>
                      <h3 className="text-xl mb-3">{page.title}</h3>
                      {page.imageUrl && (
                        <img
                          src={page.imageUrl}
                          alt={page.title}
                          className="w-full h-44 object-cover rounded-lg border border-slate-200 mb-4"
                        />
                      )}
                      <p className="text-slate-700 whitespace-pre-line leading-7">{page.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              {!hasAccess && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => router.push(`/checkout?product=${item.slug}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Unlock Full eBook
                </Button>
              )}
            </Card>

            {hasAccess && (
              <Card className="mb-8">
                <h2 className="text-2xl mb-4">Reader Security</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="text-xs uppercase tracking-wide text-indigo-600 mb-2">Watermarking</div>
                    <p className="text-sm text-slate-700">
                      Each page shows a diagonal contact watermark and QR watermark tied to the purchased account.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="text-xs uppercase tracking-wide text-indigo-600 mb-2">Read-only web access</div>
                    <p className="text-sm text-slate-700">
                      Right-click and common inspect/save shortcuts are blocked while the protected reader is open.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mb-2 text-blue-900">Digital Rights & Security</h3>
                  <p className="text-sm text-blue-800">
                    Reader access is tied to your account entitlement. Protected view mode blocks common
                    copy/inspect shortcuts, and exported copies keep the same watermark identity.
                  </p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 text-xs text-blue-900">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Entitlement-based reader unlock
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Single-device notice shown in admin policy
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Screenshot blocking depends on browser/device limitations
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Preview pages visible before purchase
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <div className="text-3xl text-indigo-600 mb-4">{formatRupees(item.price)}</div>

                {hasAccess ? (
                  <>
                    <Button
                      fullWidth
                      size="lg"
                      className="mb-3"
                      onClick={() => router.push('/dashboard/ebooks')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Read in Dashboard
                    </Button>
                    <Button
                      fullWidth
                      variant="outline"
                      size="lg"
                      className="mb-6"
                      onClick={handleDownload}
                      disabled={!item.downloadAllowed || downloading}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {item.downloadAllowed ? (downloading ? 'Preparing Download...' : 'Download Copy') : 'Download Disabled'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      fullWidth
                      size="lg"
                      className="mb-3"
                      onClick={() => router.push(`/checkout?product=${item.slug}`)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Buy {item.downloadAllowed ? '& Download' : '& Read'}
                    </Button>
                    <Button fullWidth variant="outline" size="lg" className="mb-6">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </>
                )}

                <div className="text-center text-sm text-slate-600 mb-6">{item.validityLabel}</div>

                <div className="space-y-3 border-t border-slate-200 pt-6">
                  <h3 className="mb-3">Includes:</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <span>{item.pages ?? 0} pages {item.format ?? 'PDF'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Download className="w-5 h-5 text-slate-400" />
                    <span>{item.downloadAllowed ? 'Download enabled' : 'Read online only'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Eye className="w-5 h-5 text-slate-400" />
                    <span>{item.previewAvailable ? 'Preview available' : 'No preview'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-5 h-5 text-slate-400" />
                    <span>{hasAccess ? 'Full watermarked reader unlocked' : 'Protected preview until purchase'}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
