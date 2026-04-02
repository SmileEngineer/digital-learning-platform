'use client';

import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import {
  createAdminUserAccess,
  fetchAdminUsersAccess,
  updateAdminUserAccess,
  type AdminUserAccess,
} from '@/lib/platform-api';

type FormState = {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
};

function createEmptyForm(): FormState {
  return {
    email: '',
    name: '',
    password: '',
    role: 'admin',
    permissions: [],
  };
}

function toFormState(item: AdminUserAccess): FormState {
  return {
    email: item.email,
    name: item.name,
    password: '',
    role: item.role,
    permissions: item.permissions,
  };
}

export function AdminAccessManagementPage() {
  const [items, setItems] = useState<AdminUserAccess[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>(createEmptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadItems() {
    try {
      const data = await fetchAdminUsersAccess();
      setItems(data.items);
      setPermissions(data.permissions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load admin access settings.');
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        email: form.email.trim(),
        name: form.name.trim(),
        password: form.password,
        role: form.role,
        permissions: form.permissions,
      };
      const saved = editingId
        ? await updateAdminUserAccess(editingId, payload)
        : await createAdminUserAccess(payload as Required<typeof payload>);
      setItems((current) => {
        const next = current.filter((item) => item.id !== saved.id);
        return [saved, ...next];
      });
      setEditingId(saved.id);
      setForm(toFormState(saved));
      setMessage(editingId ? 'Admin access updated.' : 'Admin user created.');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save admin access.');
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
      <div>
        <h1 className="text-3xl mb-2">Admin Access</h1>
        <p className="text-slate-600">Assign role-based admin access so each admin can only manage the modules you allow.</p>
      </div>

      {message && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-8 xl:grid-cols-[1fr,1fr]">
        <form onSubmit={handleSubmit}>
          <Card>
            <h2 className="text-2xl mb-6">{editingId ? 'Edit Admin User' : 'Create Admin User'}</h2>
            <div className="grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Name</span>
                <input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Email</span>
                <input value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">{editingId ? 'Reset password' : 'Password'}</span>
                <input type="password" value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-700">Role</span>
                <select value={form.role} onChange={(e) => setForm((c) => ({ ...c, role: e.target.value as FormState['role'] }))} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </label>
              <div>
                <span className="mb-2 block text-sm text-slate-700">Permissions</span>
                <div className="grid gap-2 md:grid-cols-2">
                  {permissions.map((permission) => (
                    <label key={permission} className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.permissions.includes(permission)}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            permissions: e.target.checked
                              ? [...current.permissions, permission]
                              : current.permissions.filter((entry) => entry !== permission),
                          }))
                        }
                      />
                      {permission}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : editingId ? 'Update Admin Access' : 'Create Admin User'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset
              </Button>
            </div>
          </Card>
        </form>

        <Card>
          <h2 className="text-2xl mb-4">Existing Admin Users</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex gap-2 mb-2 flex-wrap">
                      <Badge variant={item.role === 'super_admin' ? 'warning' : 'info'}>{item.role}</Badge>
                      {item.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission} variant="neutral">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                    <h3 className="text-lg">{item.name}</h3>
                    <p className="text-sm text-slate-600">{item.email}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setEditingId(item.id); setForm(toFormState(item)); }}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
