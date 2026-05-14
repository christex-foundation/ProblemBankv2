import { prisma } from '@/lib/prisma';
import { generateBadgeSvg } from '@/lib/badge';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const entry = await prisma.libraryEntry.findUnique({
    where: { slug },
    select: { id: true, title: true, publishedAt: true },
  });

  if (!entry) {
    return new Response('Not found', { status: 404 });
  }

  // Fire-and-forget metrics — don't block the SVG response.
  prisma
    .$transaction([
      prisma.badgePing.create({ data: { libraryEntryId: entry.id } }),
      prisma.libraryEntry.update({
        where: { id: entry.id },
        data: { badgeFetchCount: { increment: 1 } },
      }),
    ])
    .catch(() => {});

  const svg = generateBadgeSvg(entry.title.slice(0, 30));
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      // GitHub camo proxy caches based on Cache-Control. We want fresh-ish pings.
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
}
