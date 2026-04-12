'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DollarSign, Eye, Settings, Users, Video } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import {
  fetchAdminAnalytics,
  fetchSiteSettings,
  updateSiteSettings,
  type AdminAnalyticsSummary,
  type SiteSettings,
} from '@/lib/platform-api';
import { DEFAULT_HOME_BANNER, DEFAULT_MODULE_CATEGORIES, DEFAULT_SITE_NAVIGATION } from '@/lib/site-config-defaults';
import { formatRupees } from '@/lib/price';

function hasPermission(user: { role: string; adminPermissions?: string[] } | null, permission: string): boolean {
  if (!user) return false;
  return user.role === 'super_admin' || (user.adminPermissions ?? []).includes(permission);
}

const defaultSiteSettings: SiteSettings = {
  homeScrollerEnabled: true,
  homeScrollerMessage: 'Site is under construction. No orders will be fulfilled at this time.',
  homeBanner: DEFAULT_HOME_BANNER,
  navigation: DEFAULT_SITE_NAVIGATION,
  moduleCategories: DEFAULT_MODULE_CATEGORIES,
};

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function AdminDashboardPage() {
  const { user } = useAuth();
  const { refreshConfig } = useSiteConfig();
  const [analytics, setAnalytics] = useState<AdminAnalyticsSummary | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [navigationJson, setNavigationJson] = useState(formatJson(defaultSiteSettings.navigation));
  const [moduleCategoriesJson, setModuleCategoriesJson] = useState(
    formatJson(defaultSiteSettings.moduleCategories)
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const canViewAnalytics = hasPermission(user, 'analytics');
  const canManageSettings = hasPermission(user, 'settings');
  const canManageAdminAccess = hasPermission(user, 'admin_access');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [analyticsData, settingsData] = await Promise.all([
          canViewAnalytics ? fetchAdminAnalytics().catch(() => null) : Promise.resolve(null),
          canManageSettings ? fetchSiteSettings().catch(() => defaultSiteSettings) : Promise.resolve(defaultSiteSettings),
        ]);

        if (cancelled) return;

        setAnalytics(analyticsData);
        setSettings(settingsData);
        setNavigationJson(formatJson(settingsData.navigation));
        setModuleCategoriesJson(formatJson(settingsData.moduleCategories));
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load admin dashboard.');
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [canManageSettings, canViewAnalytics]);

  async function handleSaveSettings() {
    if (!canManageSettings) return;

    try {
      setSaving(true);
      setMessage(null);
      setError(null);

      const navigation = JSON.parse(navigationJson) as SiteSettings['navigation'];
      const moduleCategories = JSON.parse(moduleCategoriesJson) as SiteSettings['moduleCategories'];
      const updated = await updateSiteSettings({
        ...settings,
        navigation,
        moduleCategories,
      });

      setSettings(updated);
      setNavigationJson(formatJson(updated.navigation));
      setModuleCategoriesJson(formatJson(updated.moduleCategories));
      await refreshConfig();
      setMessage('Site settings updated successfully.');
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Navigation or module category JSON is invalid.');
      } else {
        setError(err instanceof Error ? err.message : 'Could not update site settings.');
      }
    } finally {
      setSaving(false);
    }
  }

  const cards = analytics
    ? [
        { label: 'Total Revenue', value: formatRupees(analytics.totals.revenue), icon: DollarSign },
        { label: 'Total Users', value: String(analytics.totals.users), icon: Users },
        { label: 'Active Users', value: String(analytics.totals.activeUsers), icon: Eye },
        { label: 'Live Class Attendance', value: String(analytics.totals.liveClassAttendance), icon: Video },
      ]
    : [];

  const quickLinks = useMemo(
    () => [
      canViewAnalytics ? { href: '/admin/analytics', label: 'View full analytics' } : null,
      hasPermission(user, 'coupons') ? { href: '/admin/coupons', label: 'Manage coupons' } : null,
      canManageAdminAccess ? { href: '/admin/admin-access', label: 'Manage admin access' } : null,
    ].filter(Boolean) as Array<{ href: string; label: string }>,
    [canManageAdminAccess, canViewAnalytics, user]
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl mb-2">Admin Dashboard</h1>
        <p className="text-slate-600">Overview of platform performance and site-wide controls.</p>
      </div>

      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {canViewAnalytics ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
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
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr,0.9fr]">
        {canManageSettings ? (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl">Home Banner and Scroller</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm text-slate-700">Banner eyebrow</span>
                  <input
                    value={settings.homeBanner.eyebrow}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        homeBanner: { ...current.homeBanner, eyebrow: event.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm text-slate-700">Banner title</span>
                  <textarea
                    value={settings.homeBanner.title}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        homeBanner: { ...current.homeBanner, title: event.target.value },
                      }))
                    }
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm text-slate-700">Banner description</span>
                  <textarea
                    value={settings.homeBanner.description}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        homeBanner: { ...current.homeBanner, description: event.target.value },
                      }))
                    }
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
                  <input
                    type="checkbox"
                    checked={settings.homeScrollerEnabled}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        homeScrollerEnabled: event.target.checked,
                      }))
                    }
                  />
                  Enable home page scroller
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm text-slate-700">Scroller message</span>
                  <textarea
                    value={settings.homeScrollerMessage}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        homeScrollerMessage: event.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Enter the global scrolling message for all site visitors"
                  />
                </label>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl mb-2">Menu Structure</h2>
              <p className="mb-4 text-sm text-slate-600">
                Edit course and eBook menu hierarchy. Array order controls display order.
              </p>
              <textarea
                value={navigationJson}
                onChange={(event) => setNavigationJson(event.target.value)}
                rows={18}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
              />
            </Card>

            <Card>
              <h2 className="text-xl mb-2">Module Categories</h2>
              <p className="mb-4 text-sm text-slate-600">
                Add, remove, or reorder categories for courses, eBooks, books, live classes, and practice exams.
              </p>
              <textarea
                value={moduleCategoriesJson}
                onChange={(event) => setModuleCategoriesJson(event.target.value)}
                rows={12}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
              />
              <div className="mt-4">
                <Button onClick={() => void handleSaveSettings()} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Site Settings'}
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl">Your Admin Access</h2>
            </div>
            <p className="text-sm text-slate-600">
              Your role is active, but site-wide settings are limited to admins with the `settings` permission.
            </p>
          </Card>
        )}

        <div className="space-y-6">
          <Card>
            <h2 className="text-xl mb-4">Quick Insights</h2>
            {canViewAnalytics ? (
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
            ) : (
              <p className="text-sm text-slate-600">
                Analytics summaries are available to admins with the `analytics` permission.
              </p>
            )}
          </Card>

          <Card>
            <h2 className="text-xl mb-4">Admin Shortcuts</h2>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block text-sm text-indigo-600 hover:underline">
                  {link.label}
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
