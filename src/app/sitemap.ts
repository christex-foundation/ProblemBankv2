import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://build.christex.foundation';

  let entries: { slug: string; updatedAt: Date }[] = [];
  try {
    entries = await prisma.libraryEntry.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true, updatedAt: true },
    });
  } catch {
    // DB not reachable — return static-only sitemap.
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/feed`, changeFrequency: 'hourly', priority: 0.8 },
  ];

  const entryRoutes: MetadataRoute.Sitemap = entries.map((e) => ({
    url: `${baseUrl}/library/${e.slug}`,
    lastModified: e.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticRoutes, ...entryRoutes];
}
