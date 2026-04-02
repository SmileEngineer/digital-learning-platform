'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Clock, Users, Video, Star } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { fetchCatalogItem, fetchLearnerAccess, type CatalogItem } from '@/lib/platform-api';

export function LiveClassDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const slug = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    async function load() {
      const liveClass = await fetchCatalogItem(slug);
      const access = await fetchLearnerAccess(slug).catch(() => ({ hasAccess: false, access: null }));
      if (!cancelled) {
        setItem(liveClass);
        setHasAccess(access.hasAccess);
      }
    }
    load().catch(() => {
      if (!cancelled) setItem(null);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const timeLeft = useMemo(() => {
    if (!item?.date || !item.time) return null;
    const target = item.scheduledAt ? new Date(item.scheduledAt) : null;
    if (!target) return null;
    const diff = Math.max(0, target.getTime() - Date.now());
    const totalSeconds = Math.floor(diff / 1000);
    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  }, [item]);

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="text-center py-12">
          <h1 className="text-2xl mb-2">Live class unavailable</h1>
          <p className="text-slate-600">This live class could not be found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              {item.spotsLeft !== undefined && item.spotsLeft < 10 && (
                <Badge variant="warning" className="mb-3">
                  Only {item.spotsLeft} spots left
                </Badge>
              )}
              <h1 className="text-4xl mb-3">{item.title}</h1>
              <p className="text-lg text-slate-600 mb-4">{item.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-slate-700 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{item.date} at {item.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{item.duration}</span>
                </div>
                {item.spotsLeft !== undefined && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{item.spotsLeft} spots remaining</span>
                  </div>
                )}
              </div>

              <p className="text-slate-600">
                Instructor: <span className="text-indigo-600">{item.instructor}</span>
              </p>
            </div>

            <div className="mb-8">
              <img src={item.image} alt={item.title} className="w-full h-96 object-cover rounded-lg" />
            </div>

            {timeLeft && (
              <Card className="mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                <h2 className="text-2xl mb-4 text-indigo-900">Class Starts In</h2>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(timeLeft).map(([unit, value]) => (
                    <div key={unit} className="text-center">
                      <div className="text-4xl text-indigo-600 mb-2">{value}</div>
                      <div className="text-sm text-slate-600 capitalize">{unit}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="mb-8">
              <h2 className="text-2xl mb-4">What You&apos;ll Learn</h2>
              <div className="space-y-3">
                {(item.curriculum.length ? item.curriculum : [{ title: 'Instructor-led session' }]).map((entry, index) => (
                  <div key={`${entry.title}-${index}`} className="flex gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span className="text-slate-700">{entry.title ?? 'Live class module'}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-2xl mb-4">About the Session</h2>
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex-shrink-0" />
                <div>
                  <h3 className="text-xl mb-1">{item.instructor}</h3>
                  <p className="text-slate-600 mb-3">Live class instructor</p>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                    {item.rating && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        <span>{item.rating.toFixed(1)} rating</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      <span>Google Meet style access flow</span>
                    </div>
                  </div>
                  <p className="text-slate-700">
                    Purchased learners can access this session from their dashboard when the scheduled time arrives.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <div className="text-3xl text-indigo-600 mb-4">${item.price.toFixed(2)}</div>

                <Button
                  fullWidth
                  size="lg"
                  className="mb-3"
                  onClick={() => router.push(hasAccess ? '/dashboard/live-classes' : `/checkout?product=${item.slug}`)}
                >
                  {hasAccess ? 'Open in Dashboard' : 'Enroll Now'}
                </Button>

                <div className="text-center text-sm text-slate-600 mb-6">
                  {item.spotsLeft !== undefined && item.spotsLeft < 10 ? (
                    <Badge variant="warning" size="sm">
                      Only {item.spotsLeft} spots left
                    </Badge>
                  ) : (
                    'Meeting access is restricted to enrolled users.'
                  )}
                </div>

                <div className="space-y-3 border-t border-slate-200 pt-6">
                  <h3 className="mb-3">Includes:</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <Video className="w-5 h-5 text-slate-400" />
                    <span>Live interactive session</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span>{item.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-5 h-5 text-slate-400" />
                    <span>Restricted attendee access</span>
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
