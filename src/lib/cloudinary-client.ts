'use client';

// Browser-only helpers for the Tiptap deferred-upload flow.
// Images inside the editor are kept as blob: URLs until submit, then uploaded to Cloudinary
// in one pass and the URLs in the HTML are rewritten in place.

interface PendingUploadStore {
  __tiptapPendingUploads?: Map<string, File>;
}

function getPendingStore(): Map<string, File> {
  const w = window as unknown as PendingUploadStore;
  if (!w.__tiptapPendingUploads) w.__tiptapPendingUploads = new Map<string, File>();
  return w.__tiptapPendingUploads;
}

export function stashPendingFile(blobUrl: string, file: File) {
  getPendingStore().set(blobUrl, file);
}

export function clearPendingFile(blobUrl: string) {
  const store = getPendingStore();
  store.delete(blobUrl);
  URL.revokeObjectURL(blobUrl);
}

/**
 * Find every <img src="blob:..."> inside `html`, upload the stashed File to Cloudinary,
 * and return `html` with each blob URL replaced by the resulting secure URL.
 */
export async function uploadTiptapImages(
  html: string,
  folder = 'problem-bank/submissions',
): Promise<string> {
  const blobUrls = Array.from(html.matchAll(/src="(blob:[^"]+)"/g)).map((m) => m[1]);
  if (blobUrls.length === 0) return html;

  const store = getPendingStore();
  const sigResp = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder }),
  });
  if (!sigResp.ok) {
    throw new Error('Failed to get Cloudinary signature');
  }
  const { signature, timestamp, cloudName, apiKey } = (await sigResp.json()) as {
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
  };

  let updated = html;
  for (const blobUrl of blobUrls) {
    const file = store.get(blobUrl);
    if (!file) continue;

    const form = new FormData();
    form.append('file', file);
    form.append('api_key', apiKey);
    form.append('timestamp', String(timestamp));
    form.append('folder', folder);
    form.append('signature', signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: form,
    });
    const data = (await res.json()) as {
      secure_url?: string;
      error?: { message?: string };
    };
    if (!res.ok || !data.secure_url) {
      throw new Error(data.error?.message ?? 'Cloudinary upload failed');
    }
    updated = updated.split(blobUrl).join(data.secure_url);
    clearPendingFile(blobUrl);
  }

  return updated;
}
