'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MAX_BIO_LEN } from '@/lib/enums';
import { Button } from '@/design/primitives';
import { Eyebrow } from '@/design/typography';

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

const labelCls =
  'block text-[10px] uppercase tracking-[0.22em] font-semibold text-foreground/55';
const inputCls =
  'w-full mt-2 bg-transparent border border-foreground/20 px-3 py-2.5 text-foreground placeholder:text-foreground/30 focus:border-foreground/60 focus:outline-none transition-soft';

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
    <form onSubmit={save} className="flex flex-col gap-6">
      <Eyebrow tone="muted" size="sm">
        Edit your profile
      </Eyebrow>

      <div>
        <label className={labelCls}>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
          maxLength={80}
        />
      </div>

      <div>
        <label className={labelCls}>
          Bio <span className="text-foreground/35">(max {MAX_BIO_LEN})</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className={`${inputCls} resize-y`}
          maxLength={MAX_BIO_LEN}
        />
        <p className="mt-1 text-[10px] uppercase tracking-[0.22em] num text-foreground/45">
          {bio.length}/{MAX_BIO_LEN}
        </p>
      </div>

      <div>
        <label className={labelCls}>Contact email (optional)</label>
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>GitHub URL (optional)</label>
        <input
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          className={inputCls}
          placeholder="https://github.com/yourhandle"
        />
      </div>

      <div>
        <label className={labelCls}>Website (optional)</label>
        <input
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          className={inputCls}
          placeholder="https://example.com"
        />
      </div>

      <div>
        <Button
          type="submit"
          variant="primary"
          disabled={saving}
          className="disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save profile'}
        </Button>
      </div>
    </form>
  );
}
