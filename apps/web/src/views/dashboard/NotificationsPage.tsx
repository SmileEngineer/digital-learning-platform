'use client';

import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { Bell, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { fetchNotifications, type LiveClassNotification } from '@/lib/platform-api';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function variantFor(kind: string): 'success' | 'info' | 'warning' {
  if (kind.includes('refund')) return 'success';
  if (kind.includes('cancelled')) return 'warning';
  return 'info';
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<LiveClassNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchNotifications()
      .then((items) => {
        if (!cancelled) {
          setNotifications(items);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load notifications.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="text-3xl mb-8">Notifications</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 rounded-lg border border-slate-200 bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="text-center py-12">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Notifications about purchases, reschedules, cancellations, and refunds will appear here.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {notifications.map((notif) => {
            const variant = variantFor(notif.kind);
            return (
              <Card key={notif.id} hover>
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded flex items-center justify-center ${
                      variant === 'success'
                        ? 'bg-green-100'
                        : variant === 'warning'
                          ? 'bg-amber-100'
                          : 'bg-blue-100'
                    }`}
                  >
                    {variant === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {variant === 'info' && <Info className="w-5 h-5 text-blue-600" />}
                    {variant === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1">{notif.title}</h3>
                    <p className="text-sm text-slate-600 mb-2">{notif.message}</p>
                    <span className="text-xs text-slate-500">{timeAgo(notif.createdAt)}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
