import { getSupabase } from '@/lib/supabase';
import { generateBadgeSvg } from '@/lib/badge';
import { BadgeParamsSchema } from './_schemas';
import type { LibraryEntryRow } from '@/types/database';

// Public badge endpoint. Always returns image/svg+xml so embeds in README files
// don't render as broken images. Unknown slug or bad slug → a 404 SVG that says
// "Not Found"; the error envelope is intentionally not used here because the
// endpoint is consumed by image tags, not JSON clients.

const svgHeaders = {
  'Content-Type': 'image/svg+xml; charset=utf-8',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
};

function notFoundBadge(): Response {
  return new Response(generateBadgeSvg('Not Found', 'unknown'), {
    status: 404,
    headers: svgHeaders,
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const raw = await params;
  const parsed = BadgeParamsSchema.safeParse(raw);
  if (!parsed.success) return notFoundBadge();

  const supabase = getSupabase();

  const { data: entry } = (await supabase
    .from('LibraryEntry')
    .select('id, title, publishedAt, badgeFetchCount')
    .eq('slug', parsed.data.slug)
    .maybeSingle()) as {
    data: Pick<LibraryEntryRow, 'id' | 'title' | 'publishedAt' | 'badgeFetchCount'> | null;
  };

  if (!entry) return notFoundBadge();

  // Fire-and-forget metrics — don't block the SVG response.
  void (async () => {
    try {
      await supabase.from('BadgePing').insert({ libraryEntryId: entry.id } as never);
      await supabase
        .from('LibraryEntry')
        .update({ badgeFetchCount: (entry.badgeFetchCount ?? 0) + 1 } as never)
        .eq('id', entry.id);
    } catch {
      // swallow — telemetry shouldn't break the badge response
    }
  })();

  const svg = generateBadgeSvg(entry.title.slice(0, 30));
  return new Response(svg, { headers: svgHeaders });
}
