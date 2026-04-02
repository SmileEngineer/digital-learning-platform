'use client';

import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { Video } from 'lucide-react';
import { fetchLearnerLibrary, type LearnerLibraryItem } from '@/lib/platform-api';

export function MyLiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState<LearnerLibraryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      <h1 className="text-3xl mb-8">My Live Classes</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-4">
        {liveClasses.map((liveClass) => {
          const isUpcoming = !!liveClass.scheduledAt && new Date(liveClass.scheduledAt) > new Date();
          return (
            <Card key={liveClass.slug} hover>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded flex items-center justify-center">
                  <Video className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1">{liveClass.title}</h3>
                  <div className="text-sm text-slate-600">
                    {liveClass.date} at {liveClass.time}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={isUpcoming ? 'warning' : 'success'}>
                    {isUpcoming ? 'Upcoming' : 'Accessible'}
                  </Badge>
                  <Button size="sm" disabled={!liveClass.meetingUrl}>
                    {isUpcoming ? 'Join Class' : 'Open Access'}
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
