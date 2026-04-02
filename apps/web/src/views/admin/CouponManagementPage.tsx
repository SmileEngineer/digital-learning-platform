'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { Edit, Plus, RefreshCw } from 'lucide-react';
import {
  createAdminCoupon,
  fetchAdminCoupons,
  updateAdminCoupon,
  type AdminCoupon,
  type AdminCouponInput,
} from '@/lib/platform-api';

type FormState = {
  code: string;
  discountType: 'percent' | 'flat' | 'free';
  amount: string;
  isActive: boolean;
  validFrom: string;
  validTo: string;
  usageLimit: string;
  applicableTypesText: string;
  applicableSlugsText: string;
  applicableEmailsText: string;
};

function createEmptyForm(): FormState {
  return {
    code: '',
    discountType: 'percent',
    amount: '10',
    isActive: true,
    validFrom: '',
    validTo: '',
    usageLimit: '',
    applicableTypesText: '',
    applicableSlugsText: '',
    applicableEmailsText: '',
  };
}

function toFormState(item: AdminCoupon): FormState {
  return {
    code: item.code,
    discountType: item.discountType,
    amount: String(item.amount),
    isActive: item.isActive,
    validFrom: item.validFrom ? item.validFrom.slice(0, 16) : '',
    validTo: item.validTo ? item.validTo.slice(0, 16) : '',
    usageLimit: item.usageLimit ? String(item.usageLimit) : '',
    applicableTypesText: item.applicableTypes.join(', '),
    applicableSlugsText: item.applicableSlugs.join(', '),
    applicableEmailsText: item.applicableEmails.join(', '),
  };
}

function toPayload(form: FormState): AdminCouponInput {
  return {
    code: form.code.trim().toUpperCase(),
    discountType: form.discountType,
    amount: Number(form.amount),
    isActive: form.isActive,
    validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
    validTo: form.validTo ? new Date(form.validTo).toISOString() : null,
    usageLimit: form.usageLimit.trim() ? Number(form.usageLimit) : null,
    applicableTypes: form.applicableTypesText.split(',').map((v) => v.trim()).filter(Boolean),
    applicableSlugs: form.applicableSlugsText.split(',').map((v) => v.trim()).filter(Boolean),
    applicableEmails: form.applicableEmailsText.split(',').map((v) => v.trim()).filter(Boolean),
  };
}

export function CouponManagementPage() {
  const [items, setItems] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(createEmptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadItems() {
    try {
      setLoading(true);
      const data = await fetchAdminCoupons();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load coupons.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  const orderedItems = useMemo(
    () => [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [items]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = toPayload(form);
      const saved = editingId ? await updateAdminCoupon(editingId, payload) : await createAdminCoupon(payload);
      setItems((current) => {
        const next = current.filter((item) => item.id !== saved.id);
        return [saved, ...next];
      });
      setEditingId(saved.id);
      setForm(toFormState(saved));
      setMessage(editingId ? 'Coupon updated successfully.' : 'Coupon created successfully.');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save coupon.');
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(createEmptyForm());
    setMessage(null);
    setError(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl">Coupon Management</h1>
          <p className="mt-2 text-slate-600">Create restricted coupons by module, slug, email, date, and usage limit.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => void loadItems()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={resetForm}>
            <Plus className="w-4 h-4 mr-2" />
            New Coupon
          </Button>
        </div>
      </div>

      {message && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-8 xl:grid-cols-[1.1fr,0.9fr]">
        <form onSubmit={handleSubmit}>
          <Card>
            <h2 className="text-2xl mb-6">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Coupon code</span>
                <input value={form.code} onChange={(e) => setForm((c) => ({ ...c, code: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Discount type</span>
                <select value={form.discountType} onChange={(e) => setForm((c) => ({ ...c, discountType: e.target.value as FormState['discountType'] }))} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                  <option value="percent">Percent</option>
                  <option value="flat">Flat</option>
                  <option value="free">Free access</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Amount</span>
                <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((c) => ({ ...c, amount: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="inline-flex items-center gap-2 text-sm mt-8">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((c) => ({ ...c, isActive: e.target.checked }))} />
                Coupon is active
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Valid from</span>
                <input type="datetime-local" value={form.validFrom} onChange={(e) => setForm((c) => ({ ...c, validFrom: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Valid to</span>
                <input type="datetime-local" value={form.validTo} onChange={(e) => setForm((c) => ({ ...c, validTo: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-slate-700">Usage limit</span>
                <input type="number" min="1" value={form.usageLimit} onChange={(e) => setForm((c) => ({ ...c, usageLimit: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Leave empty for unlimited" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-slate-700">Applicable modules</span>
                <input value={form.applicableTypesText} onChange={(e) => setForm((c) => ({ ...c, applicableTypesText: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="course, ebook, physical_book, live_class, practice_exam" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-slate-700">Applicable slugs</span>
                <input value={form.applicableSlugsText} onChange={(e) => setForm((c) => ({ ...c, applicableSlugsText: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="optional comma-separated slugs" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-slate-700">Applicable emails</span>
                <input value={form.applicableEmailsText} onChange={(e) => setForm((c) => ({ ...c, applicableEmailsText: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="optional comma-separated emails" />
              </label>
            </div>

            <div className="mt-8 flex gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : editingId ? 'Update Coupon' : 'Create Coupon'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset
              </Button>
            </div>
          </Card>
        </form>

        <Card>
          <h2 className="text-2xl mb-4">Coupons</h2>
          <div className="space-y-4">
            {loading ? (
              <p className="text-slate-600">Loading coupons…</p>
            ) : orderedItems.length === 0 ? (
              <p className="text-slate-600">No coupons created yet.</p>
            ) : (
              orderedItems.map((coupon) => (
                <div key={coupon.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <Badge variant={coupon.isActive ? 'success' : 'warning'}>
                          {coupon.isActive ? 'active' : 'inactive'}
                        </Badge>
                        <Badge variant="neutral">{coupon.discountType}</Badge>
                      </div>
                      <h3 className="text-lg">{coupon.code}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {coupon.discountType === 'free' ? 'Free access' : coupon.amount}
                        {coupon.discountType === 'percent' ? '%' : ''}
                        {coupon.discountType === 'flat' ? ' flat' : ''} • used {coupon.usedCount}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => { setEditingId(coupon.id); setForm(toFormState(coupon)); }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
