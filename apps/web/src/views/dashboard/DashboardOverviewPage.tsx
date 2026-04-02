'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, ClipboardList, FileText, Package, Video, BookOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { fetchDashboardOverview, type DashboardOverview } from '@/lib/platform-api';

function getContinueLearningHref(type: string, slug: string): string {
  switch (type) {
    case 'course':
      return `/courses/${slug}?resume=1`;
    case 'ebook':
      return `/ebooks/${slug}`;
    case 'live_class':
      return `/live-classes/${slug}`;
    case 'practice_exam':
      return `/practice-exams/${slug}`;
    case 'physical_book':
      return `/books/${slug}`;
    case 'article':
      return `/articles/${slug}`;
    default:
      return '/dashboard';
  }
}

export function DashboardOverviewPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDashboardOverview()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load dashboard.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = data?.counts ?? { courses: 0, ebooks: 0, live_classes: 0, exams: 0 };
  const statCards: Array<{
    label: string;
    value: number;
    sub: string;
    icon: LucideIcon;
    gradient: string;
  }> = [
    { label: 'Courses', value: counts.courses, sub: 'Active access', icon: BookOpen, gradient: 'from-blue-500 to-blue-600' },
    { label: 'eBooks', value: counts.ebooks, sub: 'Library items', icon: FileText, gradient: 'from-purple-500 to-purple-600' },
    { label: 'Live Classes', value: counts.live_classes, sub: 'Scheduled access', icon: Video, gradient: 'from-green-500 to-green-600' },
    { label: 'Exams', value: counts.exams, sub: 'Attempts available', icon: ClipboardList, gradient: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Dashboard</h1>
        <p className="text-slate-600">Welcome back! Here&apos;s your learning progress.</p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
          <Card key={card.label} className={`bg-gradient-to-br ${card.gradient} text-white`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80">{card.label}</span>
              <Icon className="w-5 h-5 text-white/70" />
            </div>
            <div className="text-3xl mb-1">{card.value}</div>
            <div className="text-sm text-white/80">{card.sub}</div>
          </Card>
        )})}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-xl mb-4">Continue Learning</h2>
          <div className="space-y-4">
            {data?.recentAccess.length ? (
              data.recentAccess.map((item) => (
                <button
                  type="button"
                  key={`${item.type}-${item.slug}`}
                  className="flex w-full items-center gap-4 rounded-lg bg-slate-50 p-3 text-left transition hover:bg-slate-100"
                  onClick={() => router.push(getContinueLearningHref(item.type, item.slug))}
                >
                  <img src={item.image} alt={item.title} className="w-16 h-12 rounded object-cover" />
                  <div className="flex-1">
                    <h3 className="text-sm mb-1">{item.title}</h3>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${item.progress}%` }} />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {item.progress}% complete • {item.expires}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-600">No recent learner activity yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl mb-4">Upcoming Live Classes</h2>
          <div className="space-y-4">
            {data?.upcomingLiveClasses.length ? (
              data.upcomingLiveClasses.map((item) => (
                <div key={item.slug} className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm mb-1">{item.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span>{item.time}</span>
                    </div>
                    <Badge variant="warning" size="sm" className="mt-2">
                      {item.countdown}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No upcoming live classes yet.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl mb-4">Recent Activity</h2>
          <div className="space-y-3 text-sm">
            {data?.recentAccess.length ? (
              data.recentAccess.map((item) => (
                <div key={`activity-${item.slug}`} className="flex items-center gap-3 text-slate-600">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  <span>
                    {item.title} • {item.progress}% progress
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-600">No recent activity yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl mb-4">Pending Orders</h2>
          <div className="space-y-3">
            {data?.pendingOrders.length ? (
              data.pendingOrders.map((order, index) => (
                <div
                  key={`${order.title}-${index}`}
                  className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200"
                >
                  <Package className="w-5 h-5 text-amber-600" />
                  <div className="flex-1">
                    <div className="text-sm mb-1">{order.title}</div>
                    <Badge variant={order.status === 'delivered' ? 'success' : 'warning'} size="sm">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-600">No pending orders.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
