'use client';

import { useState } from 'react';
import { DOC_TYPES, type DocTypeKey } from '@/lib/enums';

interface DocumentItem {
  id: string;
  docType: string;
  cloudinaryUrl: string;
  fileName: string;
}

export default function DocumentTabs({ documents }: { documents: DocumentItem[] }) {
  const byType = new Map(documents.map((d) => [d.docType, d]));
  const firstAvailable = DOC_TYPES.find((t) => byType.has(t.key))?.key ?? 'concept_note';
  const [active, setActive] = useState<DocTypeKey>(firstAvailable as DocTypeKey);
  const current = byType.get(active);

  return (
    <section className="my-6">
      <div className="flex flex-wrap gap-1 border-b mb-4 -mx-1">
        {DOC_TYPES.map((t) => {
          const present = byType.has(t.key);
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key as DocTypeKey)}
              disabled={!present}
              className={`px-3 py-2 text-sm mx-1 ${
                active === t.key
                  ? 'border-b-2 border-black font-medium'
                  : 'text-gray-600 hover:text-black'
              } ${!present ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {current ? (
        <div className="border rounded p-4">
          <p className="font-medium mb-2">
            {DOC_TYPES.find((t) => t.key === current.docType)?.label}
          </p>
          <p className="text-sm text-gray-600 mb-3">{current.fileName}</p>
          <div className="flex gap-3">
            <a
              href={current.cloudinaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50"
            >
              Open
            </a>
            <a
              href={current.cloudinaryUrl}
              download={current.fileName}
              className="px-3 py-1.5 bg-black text-white rounded text-sm"
            >
              Download
            </a>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Document not available.</p>
      )}
    </section>
  );
}
