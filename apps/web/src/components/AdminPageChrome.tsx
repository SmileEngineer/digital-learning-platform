import type { ReactNode } from 'react';
import { Card } from '@/components/Card';

type StatTone = 'default' | 'success' | 'warning' | 'info';

type AdminPageStat = {
  label: string;
  value: string;
  tone?: StatTone;
};

function statToneClassName(tone: StatTone): string {
  switch (tone) {
    case 'success':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-800';
    case 'info':
      return 'border-indigo-200 bg-indigo-50 text-indigo-800';
    default:
      return 'border-slate-200 bg-white text-slate-700';
  }
}

export function AdminPageHeader({
  eyebrow = 'Admin Workspace',
  title,
  description,
  stats = [],
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  stats?: AdminPageStat[];
  actions?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-sm">
      <div className="flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-200">{eyebrow}</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
      {stats.length > 0 ? (
        <div className="grid gap-3 border-t border-white/10 bg-white/5 px-6 py-4 sm:grid-cols-2 xl:grid-cols-4 xl:px-8">
          {stats.map((stat) => (
            <div key={`${stat.label}-${stat.value}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</div>
              <div className="mt-1 text-xl font-semibold">{stat.value}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AdminNotice({
  tone,
  children,
}: {
  tone: 'success' | 'error';
  children: ReactNode;
}) {
  const className =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-red-200 bg-red-50 text-red-700';

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${className}`}>{children}</div>;
}

export function AdminSectionCard({
  title,
  description,
  badge,
  className = '',
  children,
}: {
  title: string;
  description?: string;
  badge?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={`rounded-3xl border-slate-200 shadow-sm ${className}`}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
          {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
        {badge ? <div>{badge}</div> : null}
      </div>
      {children}
    </Card>
  );
}

export function AdminMiniStatGrid({ stats }: { stats: AdminPageStat[] }) {
  if (stats.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={`${stat.label}-${stat.value}`}
          className={`rounded-2xl border px-4 py-3 ${statToneClassName(stat.tone ?? 'default')}`}
        >
          <div className="text-xs font-medium uppercase tracking-wide opacity-75">{stat.label}</div>
          <div className="mt-1 text-lg font-semibold">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
