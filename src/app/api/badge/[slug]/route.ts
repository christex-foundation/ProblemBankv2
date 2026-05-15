import { getSupabase } from '@/lib/supabase';
import { generateBadgeSvg } from '@/lib/badge';
import type { LibraryEntryRow } from '@/types/database';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = getSupabase();

  const { data: entry } = (await supabase
    .from('LibraryEntry')
    .select('id, title, publishedAt, badgeFetchCount')
    .eq('slug', slug)
    .maybeSingle()) as {
    data: Pick<LibraryEntryRow, 'id' | 'title' | 'publishedAt' | 'badgeFetchCount'> | null;
  };

  if (!entry) {
    return new Response('Not found', { status: 404 });
  }

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
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
}
