'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MAX_BIO_LEN } from '@/lib/enums';

interface Props {
  userId: string;
  user: {
    name: string | null;
    bio: string | null;
    contactEmail: string | null;
    githubUrl: string | null;
    websiteUrl: string | null;
  };
}

export default function BuilderProfileEditor({ userId, user }: Props) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? '');
  const [bio, setBio] = useState(user.bio ?? '');
  const [contactEmail, setContactEmail] = useState(user.contactEmail ?? '');
  const [githubUrl, setGithubUrl] = useState(user.githubUrl ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(user.websiteUrl ?? '');
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/builders/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          bio,
          contactEmail,
          githubUrl,
          websiteUrl,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: { code?: string; message?: string };
        };
        throw new Error(data.error?.message ?? 'Failed to save');
      }
      toast.success('Profile updated');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4 mt-8 border-t pt-6">
      <h2 className="font-semibold">Edit your profile</h2>

      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 mt-1"
          maxLength={80}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Bio <span className="text-gray-500">(max {MAX_BIO_LEN} chars)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full border rounded px-3 py-2 mt-1"
          maxLength={MAX_BIO_LEN}
        />
        <p className="text-xs text-gray-500 mt-1">
          {bio.length}/{MAX_BIO_LEN}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium">Contact email (optional)</label>
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className="w-full border rounded px-3 py-2 mt-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">GitHub URL (optional)</label>
        <input
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          className="w-full border rounded px-3 py-2 mt-1"
          placeholder="https://github.com/yourhandle"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Website (optional)</label>
        <input
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          className="w-full border rounded px-3 py-2 mt-1"
          placeholder="https://example.com"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}
