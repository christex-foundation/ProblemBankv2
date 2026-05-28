import type { MetadataRoute } from 'next';
import { SAMPLE_LIBRARY_ENTRIES } from '@/data/sampleLibraryEntries';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? 'https://build.christex.foundation';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/library`, changeFrequency: 'daily', priority: 0.9 },
  ];

  const entryRoutes: MetadataRoute.Sitemap = SAMPLE_LIBRARY_ENTRIES.map(
    (e) => ({
      url: `${baseUrl}/library/${e.slug}`,
      lastModified: new Date(e.publishedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    }),
  );

  return [...staticRoutes, ...entryRoutes];
}
