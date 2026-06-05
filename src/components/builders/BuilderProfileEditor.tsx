'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MAX_BIO_LEN } from '@/lib/enums';
import { Button, Input, Textarea } from '@/design/primitives';
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
        <label htmlFor="profile-name" className={labelCls}>Name</label>
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2"
          maxLength={80}
        />
      </div>

      <div>
        <label htmlFor="profile-bio" className={labelCls}>
          Bio <span className="text-foreground/35">(max {MAX_BIO_LEN})</span>
        </label>
        <Textarea
          id="profile-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="mt-2"
          maxLength={MAX_BIO_LEN}
          aria-describedby="profile-bio-count"
        />
        <p
          id="profile-bio-count"
          aria-live="polite"
          className="mt-1 text-[10px] uppercase tracking-[0.22em] num text-foreground/45"
        >
          {bio.length}/{MAX_BIO_LEN}
        </p>
      </div>

      <div>
        <label htmlFor="profile-contact-email" className={labelCls}>Contact email (optional)</label>
        <Input
          id="profile-contact-email"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className="mt-2"
        />
      </div>

      <div>
        <label htmlFor="profile-github" className={labelCls}>GitHub URL (optional)</label>
        <Input
          id="profile-github"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          className="mt-2"
          placeholder="https://github.com/yourhandle"
        />
      </div>

      <div>
        <label htmlFor="profile-website" className={labelCls}>Website (optional)</label>
        <Input
          id="profile-website"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          className="mt-2"
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
