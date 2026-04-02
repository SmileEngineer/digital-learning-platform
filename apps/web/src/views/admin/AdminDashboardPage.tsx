'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { DollarSign, Eye, Settings, Users, Video } from 'lucide-react';
import { fetchAdminAnalytics, fetchSiteSettings, updateSiteSettings, type AdminAnalyticsSummary, type SiteSettings } from '@/lib/platform-api';
import { useAuth } from '@/contexts/AuthContext';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AdminAnalyticsSummary | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({ homeScrollerEnabled: false, homeScrollerMessage: '' });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [analyticsData, settingsData] = await Promise.all([
          fetchAdminAnalytics().catch(() => null),
          fetchSiteSettings().catch(() => ({ homeScrollerEnabled: false, homeScrollerMessage: '' })),
        ]);
        if (!cancelled) {
          setAnalytics(analyticsData);
          setSettings(settingsData);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load admin dashboard.');
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSaveSettings() {
    try {
      setSaving(true);
      const updated = await updateSiteSettings(settings);
      setSettings(updated);
      setMessage('Home page scroller settings updated.');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update scroller settings.');
    } finally {
      setSaving(false);
    }
  }

  const cards = analytics
    ? [
        { label: 'Total Revenue', value: `$${analytics.totals.revenue.toFixed(2)}`, icon: DollarSign },
        { label: 'Total Users', value: String(analytics.totals.users), icon: Users },
        { label: 'Active Users', value: String(analytics.totals.activeUsers), icon: Eye },
        { label: 'Live Class Attendance', value: String(analytics.totals.liveClassAttendance), icon: Video },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl mb-2">Admin Dashboard</h1>
        <p className="text-slate-600">Overview of platform performance and admin controls.</p>
      </div>

      {message && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600">{card.label}</span>
                <Icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-3xl">{card.value}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl">Home Page Scroller</h2>
          </div>
          <label className="inline-flex items-center gap-2 text-sm mb-4">
            <input
              type="checkbox"
              checked={settings.homeScrollerEnabled}
              onChange={(e) => setSettings((current) => ({ ...current, homeScrollerEnabled: e.target.checked }))}
            />
            Enable home page scroller
          </label>
          <textarea
            value={settings.homeScrollerMessage}
            onChange={(e) => setSettings((current) => ({ ...current, homeScrollerMessage: e.target.value }))}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Enter the global scrolling message for all site visitors"
          />
          <div className="mt-4">
            <Button onClick={() => void handleSaveSettings()} disabled={saving}>
              {saving ? 'Saving…' : 'Save Scroller Settings'}
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl mb-4">Quick Insights</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>New registrations (30d)</span>
              <span>{analytics?.totals.newRegistrations ?? 0}</span>
            </div>
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
          <div className="mt-6 space-y-2">
            <Link href="/admin/analytics" className="block text-sm text-indigo-600 hover:underline">
              View full analytics
            </Link>
            <Link href="/admin/coupons" className="block text-sm text-indigo-600 hover:underline">
              Manage coupons
            </Link>
            {user?.role === 'super_admin' || user?.adminPermissions?.includes('admin_access') ? (
              <Link href="/admin/admin-access" className="block text-sm text-indigo-600 hover:underline">
                Manage admin access
              </Link>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
