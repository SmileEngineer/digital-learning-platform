'use client';

import { useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { postAuthChangePassword, readAuthError } from '@/lib/api';

export function ChangePasswordPage() {
  const { refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Fill in all password fields.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from the current password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await postAuthChangePassword(currentPassword, newPassword);
      if (!res.ok) {
        throw new Error(await readAuthError(res));
      }
      await refreshUser();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password updated successfully. Use the new password the next time you sign in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl mb-8">Change Password</h1>

      <Card className="max-w-2xl">
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          {error && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              role="status"
            >
              {success}
            </div>
          )}
          <div>
            <label className="block text-sm mb-2">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? 'Updating Password...' : 'Update Password'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
