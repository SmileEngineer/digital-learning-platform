'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { Clock3, Video } from 'lucide-react';
import { fetchLearnerLibrary, joinLiveClass, type LearnerLibraryItem } from '@/lib/platform-api';

function countdownText(iso: string, now: number): string {
  const diffMs = new Date(iso).getTime() - now;
  if (diffMs <= 0) return 'Live now';
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} ${hours} hour${hours === 1 ? '' : 's'} left`;
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ${minutes} minute${minutes === 1 ? '' : 's'} left`;
  return `${Math.max(minutes, 1)} minute${minutes === 1 ? '' : 's'} left`;
}

export function MyLiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState<LearnerLibraryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [joiningSlug, setJoiningSlug] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;
    fetchLearnerLibrary('live_class')
      .then((items) => {
        if (!cancelled) {
          setLiveClasses(items);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load live classes.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const orderedLiveClasses = useMemo(
    () =>
      [...liveClasses].sort((a, b) => {
        const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      }),
    [liveClasses]
  );

  async function handleJoin(slug: string) {
    try {
      setJoiningSlug(slug);
      setJoinError(null);
      const result = await joinLiveClass(slug);
      window.location.assign(result.joinUrl);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Could not validate live class access.');
    } finally {
      setJoiningSlug(null);
    }
  }

  return (
    <div>
      <h1 className="text-3xl mb-8">My Live Classes</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {joinError && <p className="mb-4 text-sm text-red-600">{joinError}</p>}

      <div className="grid grid-cols-1 gap-4">
        {orderedLiveClasses.map((liveClass) => {
          const liveClassStatus =
            typeof liveClass.metadata.liveClassStatus === 'string' ? liveClass.metadata.liveClassStatus : 'scheduled';
          const scheduledTime = liveClass.scheduledAt ? new Date(liveClass.scheduledAt).getTime() : null;
          const isUpcoming = scheduledTime !== null && scheduledTime > now;
          const isCancelled = liveClassStatus === 'cancelled';
          const countdown = liveClass.scheduledAt ? countdownText(liveClass.scheduledAt, now) : 'Schedule pending';
          return (
            <Card key={liveClass.slug} hover>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded flex items-center justify-center">
                  <Video className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1">{liveClass.title}</h3>
                  <div className="text-sm text-slate-600 mb-1">
                    {liveClass.date} at {liveClass.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock3 className="w-4 h-4" />
                    <span>{countdown}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={isCancelled ? 'error' : isUpcoming ? 'warning' : 'success'}>
                    {isCancelled ? 'Cancelled' : isUpcoming ? 'Upcoming' : 'Join window'}
                  </Badge>
                  <Button
                    size="sm"
                    disabled={isCancelled || joiningSlug === liveClass.slug}
                    onClick={() => void handleJoin(liveClass.slug)}
                  >
                    {joiningSlug === liveClass.slug
                      ? 'Checking...'
                      : isCancelled
                        ? 'Refund Pending'
                        : 'Join Class'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
