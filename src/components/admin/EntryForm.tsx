'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import TiptapEditor from '@/components/editor/TiptapEditor';
import DocumentUploader from '@/components/admin/DocumentUploader';
import { uploadTiptapImages } from '@/lib/cloudinary-client';
import { SECTORS, URGENCY_LABELS, DOC_TYPES, type DocTypeKey } from '@/lib/enums';

interface ExistingDocument {
  docType: string;
  cloudinaryUrl: string;
  fileName: string;
}

interface InitialEntry {
  id: string;
  slug: string;
  title: string;
  problemStatement: string;
  sector: string;
  urgency: keyof typeof URGENCY_LABELS;
  kitUrl: string | null;
  demoUrl: string | null;
  infographicUrl: string | null;
  publishedAt: Date | string | null;
  documents: ExistingDocument[];
}

interface SubmissionOption {
  id: string;
  title: string;
}

interface Props {
  initial?: InitialEntry;
  /** Optional list of submissions admin can link to the entry. */
  submissions?: SubmissionOption[];
}

interface UploadState {
  url: string;
  fileName: string;
}

export default function EntryForm({ initial, submissions }: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [problemStatement, setProblemStatement] = useState(initial?.problemStatement ?? '');
  const [sector, setSector] = useState(initial?.sector ?? SECTORS[0]);
  const [urgency, setUrgency] = useState<keyof typeof URGENCY_LABELS>(
    initial?.urgency ?? 'medium',
  );
  const [kitUrl, setKitUrl] = useState(initial?.kitUrl ?? '');
  const [demoUrl, setDemoUrl] = useState(initial?.demoUrl ?? '');
  const [infographic, setInfographic] = useState<UploadState | null>(
    initial?.infographicUrl
      ? { url: initial.infographicUrl, fileName: 'Existing infographic' }
      : null,
  );
  const [linkedSubmissionId, setLinkedSubmissionId] = useState('');

  const initialDocs: Record<string, UploadState | null> = useMemo(() => {
    const map: Record<string, UploadState | null> = {};
    for (const t of DOC_TYPES) map[t.key] = null;
    if (initial?.documents) {
      for (const d of initial.documents) {
        map[d.docType] = { url: d.cloudinaryUrl, fileName: d.fileName };
      }
    }
    return map;
  }, [initial]);
  const [documents, setDocuments] = useState(initialDocs);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!initial;
  const isPublished = !!initial?.publishedAt;

  const slugLooksValid = /^[a-z0-9-]+$/.test(slug);

  async function save(publish: boolean) {
    setError(null);
    if (!slugLooksValid) {
      setError('Slug must be lowercase letters, numbers, or dashes.');
      return;
    }
    setBusy(true);
    try {
      const problemHtml = await uploadTiptapImages(
        problemStatement,
        'problem-bank/library-problem-statements',
      );

      const docsPayload = Object.entries(documents)
        .filter(([, v]) => v !== null)
        .map(([docType, v]) => ({
          docType: docType as DocTypeKey,
          url: v!.url,
          fileName: v!.fileName,
        }));

      const payload = {
        id: initial?.id,
        slug,
        title,
        problemStatement: problemHtml,
        sector,
        urgency,
        kitUrl: kitUrl || null,
        demoUrl: demoUrl || null,
        infographicUrl: infographic?.url || null,
        linkedSubmissionId: linkedSubmissionId || null,
        documents: docsPayload,
        publish,
      };

      const res = await fetch('/api/admin/library', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to save');

      toast.success(publish ? 'Published' : 'Draft saved');
      if (publish) {
        router.push(`/library/${data.entry.slug}`);
      } else if (!isEdit) {
        router.push(`/admin/library/${data.entry.id}/edit`);
      } else {
        router.refresh();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  const docCount = Object.values(documents).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="w-full border rounded px-3 py-2 mt-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Slug <span className="text-gray-500">(used in /library/&lt;slug&gt;)</span>
        </label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase())}
          className="w-full border rounded px-3 py-2 mt-1"
        />
        {!slugLooksValid && slug && (
          <p className="text-xs text-red-600 mt-1">
            Lowercase letters, numbers, and dashes only.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Problem statement</label>
        <div className="mt-1">
          <TiptapEditor value={problemStatement} onChange={setProblemStatement} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Sector</label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          >
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Urgency</label>
          <select
            value={urgency}
            onChange={(e) =>
              setUrgency(e.target.value as keyof typeof URGENCY_LABELS)
            }
            className="w-full border rounded px-3 py-2 mt-1"
          >
            {Object.entries(URGENCY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Starter kit URL (optional)</label>
          <input
            value={kitUrl}
            onChange={(e) => setKitUrl(e.target.value)}
            placeholder="https://github.com/..."
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Demo URL (optional)</label>
          <input
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            placeholder="https://demo..."
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>
      </div>

      {submissions && submissions.length > 0 && (
        <div>
          <label className="block text-sm font-medium">
            Link to a community submission (optional)
          </label>
          <select
            value={linkedSubmissionId}
            onChange={(e) => setLinkedSubmissionId(e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
          >
            <option value="">— none —</option>
            {submissions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <section>
        <h2 className="font-semibold mb-1">Documents (PDF)</h2>
        <p className="text-xs text-gray-500 mb-3">
          {docCount}/6 uploaded. All six should be present before publishing.
        </p>
        <div className="space-y-3">
          {DOC_TYPES.map((t) => (
            <DocumentUploader
              key={t.key}
              docType={t.key}
              label={t.label}
              initial={documents[t.key]}
              onChange={(uploaded) =>
                setDocuments((d) => ({ ...d, [t.key]: uploaded }))
              }
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-1">Infographic (optional)</h2>
        <p className="text-xs text-gray-500 mb-3">
          Self-contained HTML file. Renders as a sandboxed iframe on the entry page.
        </p>
        <DocumentUploader
          docType="infographic"
          label="Infographic HTML"
          accept=".html"
          initial={infographic}
          onChange={setInfographic}
        />
      </section>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => save(false)}
          disabled={busy || !title || !slug}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Save draft'}
        </button>
        <button
          type="button"
          onClick={() => save(true)}
          disabled={busy || !title || !slug}
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
        >
          {busy ? 'Saving…' : isPublished ? 'Update published entry' : 'Publish'}
        </button>
      </div>
      {isPublished && (
        <p className="text-xs text-gray-500">
          This entry is published. Saving as draft will unpublish it.
        </p>
      )}
    </div>
  );
}
