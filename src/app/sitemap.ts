import type { MetadataRoute } from 'next';
import { getSupabase } from '@/lib/supabase';
import type { LibraryEntryRow } from '@/types/database';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://build.christex.foundation';

  let entries: Pick<LibraryEntryRow, 'slug' | 'updatedAt'>[] = [];
  try {
    const { data } = (await getSupabase()
      .from('LibraryEntry')
      .select('slug, updatedAt')
      .not('publishedAt', 'is', null)) as {
      data: Pick<LibraryEntryRow, 'slug' | 'updatedAt'>[] | null;
    };
    entries = data ?? [];
  } catch {
    // DB not reachable — return static-only sitemap.
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/feed`, changeFrequency: 'hourly', priority: 0.8 },
  ];

  const entryRoutes: MetadataRoute.Sitemap = entries.map((e) => ({
    url: `${baseUrl}/library/${e.slug}`,
    lastModified: new Date(e.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticRoutes, ...entryRoutes];
}
