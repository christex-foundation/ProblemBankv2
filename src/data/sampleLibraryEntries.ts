import type { UrgencyKey } from '@/lib/enums';

export type Origin = 'research' | 'community';

export interface SampleBuilder {
  id: string;
  userId: string;
  name: string;
  githubUrl: string | null;
  repoUrl: string | null;
  registeredAt: string;
}

export interface SampleLibraryEntry {
  id: string;
  slug: string;
  title: string;
  /** HTML, Tiptap-shaped. Rendered with dangerouslySetInnerHTML. */
  problemStatement: string;
  sector: string;
  urgency: UrgencyKey;
  origin: Origin;
  publishedAt: string;
  kitUrl: string | null;
  demoUrl: string | null;
  /** External infographic embed (data visualization). */
  infographicUrl: string | null;
  builders: SampleBuilder[];
}

export const SAMPLE_LIBRARY_ENTRIES: SampleLibraryEntry[] = [
  {
    id: 'lib-community-needs-assessment',
    slug: 'community-needs-assessment',
    title: 'Community Survey 2026',
    problemStatement: `
      <p>An early release of a community needs assessment: 609 people across
      four marginalised Freetown communities, plus Fourah Bay College, on the
      problems they face and the help they want. Water and sanitation dominate
      everywhere, while the support people ask for is economic, skills and
      jobs. Kroobay is hardest hit, and trust in outside help is thin, and it
      was earned.</p>
    `,
    sector: 'Infrastructure',
    urgency: 'critical',
    origin: 'research',
    publishedAt: '2026-05-20',
    kitUrl: null,
    demoUrl: null,
    infographicUrl: null,
    builders: [],
  },
];
