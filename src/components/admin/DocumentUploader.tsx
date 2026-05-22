'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface Uploaded {
  url: string;
  fileName: string;
}

interface Props {
  docType: string;
  label: string;
  accept?: string;
  initial?: Uploaded | null;
  onChange: (uploaded: Uploaded | null) => void;
}

export default function DocumentUploader({
  docType,
  label,
  accept = '.pdf',
  initial,
  onChange,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [uploaded, setUploaded] = useState<Uploaded | null>(initial ?? null);
  const [progress, setProgress] = useState(0);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setProgress(0);
    try {
      const sigResp = await fetch('/api/cloudinary/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: `problem-bank/${docType}` }),
      });
      if (!sigResp.ok) throw new Error('Failed to get signature');
      const { signature, timestamp, cloudName, apiKey, folder } = await sigResp.json();

      const form = new FormData();
      form.append('file', file);
      form.append('api_key', apiKey);
      form.append('timestamp', String(timestamp));
      form.append('folder', folder);
      form.append('signature', signature);

      // We use XHR to get progress, since fetch doesn't expose upload progress.
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const isRaw =
          file.type === 'application/pdf' ||
          file.name.endsWith('.html') ||
          file.name.endsWith('.zip');
        xhr.open(
          'POST',
          `https://api.cloudinary.com/v1_1/${cloudName}/${isRaw ? 'raw' : 'image'}/upload`,
        );
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
              resolve(data);
            } else {
              reject(new Error(data.error?.message ?? 'Upload failed'));
            }
          } catch {
            reject(new Error('Upload response malformed'));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(form);
      });

      const next: Uploaded = { url: result.secure_url, fileName: file.name };
      setUploaded(next);
      onChange(next);
      toast.success(`${label} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }

  function clear() {
    setUploaded(null);
    onChange(null);
  }

  return (
    <div className="border rounded p-3">
      <p className="text-sm font-medium mb-2">{label}</p>
      {!uploaded ? (
        <>
          <input type="file" accept={accept} onChange={upload} disabled={busy} />
          {busy && progress > 0 && (
            <p className="text-xs text-gray-500 mt-1">Uploading… {progress}%</p>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3">
          <a
            href={uploaded.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline truncate"
          >
            {uploaded.fileName}
          </a>
          <button
            type="button"
            onClick={clear}
            className="text-xs text-red-600 underline"
          >
            Replace
          </button>
        </div>
      )}
    </div>
  );
}
