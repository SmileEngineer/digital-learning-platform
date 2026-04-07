'use client';

import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { fetchAdminAnalytics, type AdminAnalyticsSummary } from '@/lib/platform-api';
import { formatRupees } from '@/lib/price';

export function AnalyticsDashboardPage() {
  const [analytics, setAnalytics] = useState<AdminAnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAdminAnalytics()
      .then((data) => {
        if (!cancelled) {
          setAnalytics(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load analytics.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl">Analytics Dashboard</h1>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl mb-4">Revenue By Module</h2>
          <div className="space-y-3">
            {(analytics?.revenueByModule ?? []).map((entry) => (
              <div key={entry.module} className="flex justify-between text-sm">
                <span>{entry.module}</span>
                <span>{formatRupees(entry.revenue)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl mb-4">Traffic</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Live visitors</span>
              <span>{analytics?.traffic.liveVisitors ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Daily visitors</span>
              <span>{analytics?.traffic.dailyVisitors ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Monthly visitors</span>
              <span>{analytics?.traffic.monthlyVisitors ?? 0}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl mb-4">Daily Sales</h2>
          <div className="space-y-3 text-sm">
            {(analytics?.dailySales ?? []).map((entry) => (
              <div key={entry.label} className="flex justify-between">
                <span>{entry.label}</span>
                <span>
                  {entry.orders} orders - {formatRupees(entry.revenue)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl mb-4">Monthly Sales</h2>
          <div className="space-y-3 text-sm">
            {(analytics?.monthlySales ?? []).map((entry) => (
              <div key={entry.label} className="flex justify-between">
                <span>{entry.label}</span>
                <span>
                  {entry.orders} orders - {formatRupees(entry.revenue)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-xl mb-4">Popular Courses</h2>
          <div className="space-y-3 text-sm">
            {(analytics?.popularCourses ?? []).map((entry) => (
              <div key={entry.slug} className="flex justify-between">
                <span>{entry.title}</span>
                <span>{entry.students} learners</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl mb-4">Book Orders By Location</h2>
          <div className="space-y-3 text-sm">
            {(analytics?.bookOrdersByLocation ?? []).map((entry) => (
              <div key={`${entry.city}-${entry.state}`} className="flex justify-between">
                <span>
                  {entry.city}, {entry.state}
                </span>
                <span>{entry.orders}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl mb-4">Coupon Usage</h2>
          <div className="space-y-3 text-sm">
            {(analytics?.couponUsage ?? []).map((entry) => (
              <div key={entry.code} className="flex justify-between">
                <span>{entry.code}</span>
                <span>
                  {entry.usedCount}
                  {entry.usageLimit ? ` / ${entry.usageLimit}` : ''}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl mb-4">Traffic Sources</h2>
          <div className="space-y-3 text-sm">
            {(analytics?.traffic.sources ?? []).map((entry) => (
              <div key={entry.source} className="flex justify-between">
                <span>{entry.source}</span>
                <span>{entry.visits}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl mb-4">Most Viewed Pages</h2>
          <div className="space-y-3 text-sm">
            {(analytics?.traffic.mostViewedPages ?? []).map((entry) => (
              <div key={entry.path} className="flex justify-between">
                <span>{entry.path}</span>
                <span>{entry.views}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
