'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { IdeaItem } from '@/lib/airtable';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function getCategoryIcon(label?: string): string {
  const CATEGORY_ICON_MAP: Record<string, string> = {
    'Feed Salone': '/images/6707c6af78a3dd5acec5512e_flower_64.webp',
    'Human Capital Development': '/images/6707c6b0778d2c6671252c5f_book_64.webp',
    'Youth Employment Scheme': '/images/6708d7e1e82809f4e18f8e05_flag_120.webp',
    'Public Service Architecture Revamp': '/images/6708d8d8f169898f7bd83ed0_heart_120.webp',
    'Tech and Infrastructure': '/images/6708d8d83911c95f3000bbfa_star_120.webp',
  };
  const FALLBACK_ICON = '/images/6708d8d8b17e6d52f343b0d3_coffee_120.webp';
  if (!label) return FALLBACK_ICON;
  return CATEGORY_ICON_MAP[label] || FALLBACK_ICON;
}

export default function IdeasInfiniteLoader({ initialOffset, initialCount = 0 }: { initialOffset?: string; initialCount?: number }) {
  const [items, setItems] = useState<IdeaItem[]>([]);
  const [offset, setOffset] = useState<string | undefined>(initialOffset);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const initialRenderedCount = initialCount; // SSR count to compute global index

  const searchParams = useSearchParams();
  const categoriesParam = searchParams.get('categories') || '';

  function getBackgroundForGlobalIndex(index1Based: number): string {
    const LIGHT = '#fffaf3';
    const DARK = '#f2e8dc';
    const block = Math.floor((index1Based - 1) / 4);
    const startIsLight = block % 2 === 0;
    const pos = (index1Based - 1) % 4;
    const isLight = startIsLight ? (pos % 2 === 0) : (pos % 2 === 1);
    return isLight ? LIGHT : DARK;
  }

  // Compute rotation angle per global index with block-wise sign alternation
  function getRotationAngleForGlobalIndex(index1Based: number): number {
    const baseAngles = [-2, 1.4, -1.2, 1.8];
    const pos = (index1Based - 1) % 4;
    const block = Math.floor((index1Based - 1) / 4);
    const angle = baseAngles[pos];
    return block % 2 === 0 ? angle : -angle;
  }

  // Reset list if initialOffset or categories change (new filter applied)
  useEffect(() => {
    setItems([]);
    setOffset(initialOffset);
  }, [initialOffset, categoriesParam]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(async (entries) => {
      const entry = entries[0];
      if (!entry.isIntersecting) return;
      if (!offset || loading) return;
      setLoading(true);
      try {
        const qs = new URLSearchParams();
        qs.set('pageSize', '16');
        qs.set('offset', offset);
        if (categoriesParam) qs.set('categories', categoriesParam);
        const res = await fetch(`/hackathon/api/ideas?${qs.toString()}`);
        const data = await res.json();
        const nextItems: IdeaItem[] = data.items || [];
        setItems((prev) => [...prev, ...nextItems]);
        setOffset(data.offset);
      } catch (e) {
        console.error('Failed to load more ideas', e);
      } finally {
        setLoading(false);
      }
    }, { rootMargin: '200px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [offset, loading, categoriesParam]);

  return (
    <div>
      {items.length > 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 items-stretch">
          {items.map((item, idx) => {
            const globalIndex = initialRenderedCount + idx + 1; // continue pattern across SSR + client
            return (
              <Link key={`${item.id}-${idx}`} href={`/hackathon/ideas/${slugify(item.title)}`} className="block">
                <div
                  className="relative border border-[#e8ddd0] shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#d8cdbc] overflow-hidden rounded-[28px] md:rounded-[34px] lg:rounded-[38px]"
                  style={{
                    height: '400px',
                    backgroundColor: getBackgroundForGlobalIndex(globalIndex),
                    transform: `rotate(${getRotationAngleForGlobalIndex(globalIndex)}deg)`,
                    transformOrigin: 'center center',
                    willChange: 'transform',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                      backgroundSize: '200px 200px',
                      backgroundRepeat: 'repeat',
                    }}
                  />
                  <div className="relative flex flex-col h-full px-6 pt-6 pb-6">
                    <div>
                      {item.category && (
                        <div className="mb-2 flex justify-center">
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
                            style={{ borderColor: '#d8cdbc', color: '#403f3e', backgroundColor: 'transparent' }}
                          >
                            {item.category}
                          </span>
                        </div>
                      )}
                      <h3
                        className="text-2xl mb-3 text-center"
                        style={{ fontFamily: 'Decoy', fontWeight: 500, color: '#403f3e' }}
                      >
                        {item.title}
                      </h3>
                    </div>
                    <div className="mt-auto">
                      <div className="flex justify-center mb-2">
                        <Image
                          src={getCategoryIcon(item.category)}
                          alt={item.category ? `${item.category} icon` : 'Category icon'}
                          width={56}
                          height={56}
                          style={{ display: 'block' }}
                          loading="lazy"
                          quality={85}
                        />
                      </div>
                      <p
                        className="text-sm leading-relaxed text-center line-clamp-5"
                        style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
                      >
                        {item.blurb}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div ref={sentinelRef} className="mt-12 flex justify-center">
        <div className="px-4 py-2 rounded-full border text-sm" style={{ borderColor: '#d8cdbc', color: '#403f3e' }}>
          {loading ? 'Loading…' : offset ? 'Scroll to load more' : 'No more ideas'}
        </div>
      </div>
    </div>
  );
}