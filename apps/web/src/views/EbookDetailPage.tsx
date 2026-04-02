'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, Eye, FileText, Shield, Star } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCatalogItem, fetchLearnerAccess, type CatalogItem } from '@/lib/platform-api';

export function EbookDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const slug = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [item, setItem] = useState<CatalogItem | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const ebook = await fetchCatalogItem(slug);
        let access = false;
        if (user) {
          access = (await fetchLearnerAccess(slug)).hasAccess;
        }
        if (!cancelled) {
          setItem(ebook);
          setHasAccess(access);
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

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-slate-600">Loading ebook…</div>;
  }

  if (!item || error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="text-center py-12">
          <h1 className="text-2xl mb-2">eBook unavailable</h1>
          <p className="text-slate-600">{error ?? 'This ebook could not be found.'}</p>
        </Card>
      </div>
    );
  }

  const previewPages = Array.from({ length: Math.max(1, item.previewCount ?? 1) }, (_, i) => i + 1);

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
                {item.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span>{item.rating.toFixed(1)} rating</span>
                  </div>
                )}
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
                {(item.curriculum.length > 0
                  ? item.curriculum.map((entry) => entry.title || `${entry.lectures ?? 0} chapters`)
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
                  Purchased readers receive protected access. The current implementation uses entitlement
                  checks from your account before showing the full content experience.
                </p>
              </div>
            </Card>

            <Card className="mb-8">
              <h2 className="text-2xl mb-4">Preview Pages</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewPages.map((page) => (
                  <div
                    key={page}
                    className="aspect-[3/4] rounded border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-3 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 rotate-[-24deg] text-3xl font-black text-slate-500">
                      {user?.email ?? 'Preview'}
                    </div>
                    <div className="flex h-full flex-col items-center justify-center text-slate-500">
                      <Eye className="w-8 h-8 mb-2" />
                      <span className="text-sm">Page {page}</span>
                    </div>
                  </div>
                ))}
              </div>
              {!hasAccess && (
                <Button variant="outline" className="w-full mt-4" onClick={() => router.push(`/checkout?product=${item.slug}`)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Unlock Full eBook
                </Button>
              )}
            </Card>

            {hasAccess && (
              <Card className="mb-8">
                <h2 className="text-2xl mb-4">Reader Access</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-[3/4] rounded border border-slate-200 bg-white p-4 relative overflow-hidden shadow-sm"
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] rotate-[-24deg] text-3xl font-black text-slate-500">
                        {user?.email ?? 'LearnHub'}
                      </div>
                      <div className="relative z-10 flex h-full flex-col justify-between">
                        <div className="text-xs uppercase tracking-wide text-indigo-600">Watermarked</div>
                        <p className="text-sm text-slate-700">
                          Secure page preview for {item.title}. Download rights are{' '}
                          {item.downloadAllowed ? 'enabled' : 'disabled'} for this item.
                        </p>
                        <div className="text-xs text-slate-500">Page sample {index + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card>
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="mb-2 text-blue-900">Digital Rights & Security</h3>
                  <p className="text-sm text-blue-800">
                    Downloads and reading access are tied to your account entitlement. Watermark and
                    protected-reader flows can be extended further from this foundation.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <div className="text-3xl text-indigo-600 mb-4">${item.price.toFixed(2)}</div>

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
                      disabled={!item.downloadAllowed}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {item.downloadAllowed ? 'Download Copy' : 'Download Disabled'}
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
                    <span>Protected entitlement-based access</span>
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
