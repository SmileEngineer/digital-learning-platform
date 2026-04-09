'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAuthProfile, patchAuthProfile, type AuthProfile } from '@/lib/api';

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

function initialsFromName(fullName: string): string {
  return (
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U'
  );
}

export function ProfileSettingsPage() {
  const { refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchAuthProfile()
      .then((nextProfile) => {
        if (cancelled) return;
        const nameParts = splitName(nextProfile.name);
        setProfile(nextProfile);
        setFirstName(nameParts.firstName);
        setLastName(nameParts.lastName);
        setEmail(nextProfile.email);
        setPhone(nextProfile.phone);
        setBio(nextProfile.bio);
        setProfileImageUrl(nextProfile.profileImageUrl);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load profile settings.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const fullName = useMemo(
    () => [firstName.trim(), lastName.trim()].filter(Boolean).join(' ').trim(),
    [firstName, lastName]
  );

  async function handlePhotoFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Profile photo must be a JPG or PNG image.');
      event.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Profile photo must be under 2MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (result) {
        setProfileImageUrl(result);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError('Could not read the selected image.');
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    try {
      const updated = await patchAuthProfile({
        name: fullName,
        email: email.trim().toLowerCase(),
        phone,
        bio,
        profileImageUrl,
      });
      setProfile(updated);
      setProfileImageUrl(updated.profileImageUrl);
      await refreshUser();
      setSuccess('Profile settings saved successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile settings.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl">Profile Settings</h1>

      <Card className="max-w-2xl">
        {loading ? (
          <p className="text-slate-600">Loading profile settings...</p>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
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

            <div className="flex items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xl font-semibold text-slate-700">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={fullName || profile?.name || 'Profile photo'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initialsFromName(fullName || profile?.name || '')}</span>
                )}
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handlePhotoFileChange}
                />
                <div className="flex flex-wrap gap-3">
                  <Button size="sm" type="button" onClick={() => fileInputRef.current?.click()}>
                    Change Photo
                  </Button>
                  {profileImageUrl && (
                    <Button size="sm" type="button" variant="outline" onClick={() => setProfileImageUrl(null)}>
                      Remove Photo
                    </Button>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-600">JPG or PNG, max 2MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm">Bio</label>
              <textarea
                rows={4}
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
              />
              <p className="mt-2 text-xs text-slate-500">{bio.length}/1500 characters</p>
            </div>

            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
