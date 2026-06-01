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
    id: 'lib-cold-chain-bonthe',
    slug: 'cold-chain-bonthe',
    title: 'Cold-chain logistics for vaccines in Bonthe District',
    problemStatement: `
      <p>Vaccines bound for the Bonthe District island chiefdoms travel
      four-to-seven hours by boat from Bo, often arriving at temperatures
      outside the 2–8°C window the manufacturer requires. Nurses we
      interviewed estimate that <strong>one in five vials is visibly compromised</strong>
      on arrival and another share is silently spoiled. The current ledger
      is paper: when a batch goes bad, the cause is rarely traceable.</p>
      <p>The opportunity is a small, low-power data logger paired with a
      lightweight handover app that captures who carried the cooler when,
      and at what temperature. The cost of the logger needs to come in under
      US$15 per unit and survive a saltwater commute.</p>
    `,
    sector: 'Health',
    urgency: 'critical',
    origin: 'research',
    publishedAt: '2026-04-12',
    kitUrl: 'https://github.com/christex-foundation/cold-chain-starter',
    demoUrl: 'https://cold-chain-demo.vercel.app',
    infographicUrl: null,
    builders: [
      {
        id: 'b1',
        userId: 'u-alusine',
        name: 'Alusine Kamara',
        githubUrl: 'https://github.com/alusinek',
        repoUrl: 'https://github.com/alusinek/cold-chain-watch',
        registeredAt: '2026-04-15',
      },
      {
        id: 'b2',
        userId: 'u-fatmata',
        name: 'Fatmata Sesay',
        githubUrl: 'https://github.com/fatsesay',
        repoUrl: null,
        registeredAt: '2026-04-21',
      },
    ],
  },
  {
    id: 'lib-fertilizer-kambia',
    slug: 'fertilizer-authenticity-kambia',
    title: 'Fertilizer authenticity in Kambia',
    problemStatement: `
      <p>Smallholder farmers in Kambia report buying bags of fertilizer
      that yield far below the printed nutrient claim. Counterfeit and
      diluted product enters the supply chain at the border and again at
      district markets. The economic damage compounds: a failed planting
      season costs both the input and the harvest.</p>
      <p>A trustable verification rail, low-friction enough for a feature-phone
      buyer, could materially shift purchasing behavior. A scratch-off code,
      USSD lookup, or chemical test strip — the right answer is unknown;
      the field research is in the kit.</p>
    `,
    sector: 'Agriculture',
    urgency: 'high',
    origin: 'community',
    publishedAt: '2026-04-28',
    kitUrl: 'https://github.com/christex-foundation/fertilizer-verify-starter',
    demoUrl: 'https://fertilizer-verify-demo.vercel.app',
    infographicUrl: null,
    builders: [
      {
        id: 'b3',
        userId: 'u-mohamed',
        name: 'Mohamed Bangura',
        githubUrl: 'https://github.com/mbangura',
        repoUrl: 'https://github.com/mbangura/fert-check',
        registeredAt: '2026-05-02',
      },
    ],
  },
  {
    id: 'lib-trades-pujehun',
    slug: 'trades-certification-pujehun',
    title: 'Trades training certification in Pujehun',
    problemStatement: `
      <p>Vocational graduates in Pujehun finish six-to-twelve month training
      programmes without a credential the regional labour market recognises.
      Employers default to apprentice-style trials. Graduates leave the
      district for work and the regional economy loses the skill.</p>
      <p>A portable, employer-verifiable credential, anchored to the curriculum
      and exam record, could unlock placement at scale. The Concept Note proposes
      a QR-printed certificate backed by a signed registry; the PRD weighs
      this against offline-first alternatives.</p>
    `,
    sector: 'Education',
    urgency: 'high',
    origin: 'research',
    publishedAt: '2026-05-04',
    kitUrl: null,
    demoUrl: null,
    infographicUrl: null,
    builders: [],
  },
  {
    id: 'lib-feeder-roads',
    slug: 'rainy-season-feeder-roads',
    title: 'Rainy-season feeder-road routing',
    problemStatement: `
      <p>Between June and October, the country's feeder-road network rebuilds
      itself daily. The Ministry's static map cannot keep pace: drivers learn
      which routes are passable through WhatsApp groups, hours after the fact.
      Aggregators and freight planners absorb the cost.</p>
      <p>A community-reported passability signal, lightly moderated and
      time-decayed, could route around hazards before drivers commit. The PRD
      explores incentives for reporting and the cold-start problem.</p>
    `,
    sector: 'Logistics',
    urgency: 'critical',
    origin: 'community',
    publishedAt: '2026-05-10',
    kitUrl: 'https://github.com/christex-foundation/feeder-roads-starter',
    demoUrl: 'https://feeder-roads-demo.vercel.app',
    infographicUrl: null,
    builders: [
      {
        id: 'b4',
        userId: 'u-isatu',
        name: 'Isatu Conteh',
        githubUrl: 'https://github.com/iconteh',
        repoUrl: 'https://github.com/iconteh/road-watch',
        registeredAt: '2026-05-12',
      },
      {
        id: 'b5',
        userId: 'u-ibrahim',
        name: 'Ibrahim Jalloh',
        githubUrl: null,
        repoUrl: null,
        registeredAt: '2026-05-14',
      },
      {
        id: 'b6',
        userId: 'u-amadu',
        name: 'Amadu Turay',
        githubUrl: 'https://github.com/aturay',
        repoUrl: 'https://github.com/aturay/passability',
        registeredAt: '2026-05-18',
      },
    ],
  },
  {
    id: 'lib-mm-liquidity',
    slug: 'mobile-money-month-end-liquidity',
    title: 'Mobile-money liquidity at month-end',
    problemStatement: `
      <p>Mobile-money agents run out of cash at the end of every pay cycle.
      Customers who depend on cash-out for rent or school fees queue, retry
      across kiosks, and sometimes give up. The shortage is predictable; the
      response is improvised.</p>
      <p>An agent-side forecasting nudge — read float, read pattern, suggest
      a rebalance window — could smooth supply. The Technical Design considers
      both an agent-app integration and a USSD-only path.</p>
    `,
    sector: 'Finance',
    urgency: 'high',
    origin: 'research',
    publishedAt: '2026-05-17',
    kitUrl: 'https://github.com/christex-foundation/mm-liquidity-starter',
    demoUrl: null,
    infographicUrl: null,
    builders: [
      {
        id: 'b7',
        userId: 'u-mariama',
        name: 'Mariama Koroma',
        githubUrl: 'https://github.com/mkoroma',
        repoUrl: 'https://github.com/mkoroma/float-coach',
        registeredAt: '2026-05-19',
      },
    ],
  },
  {
    id: 'lib-borehole-uptime',
    slug: 'borehole-uptime-monitoring',
    title: 'Borehole uptime monitoring',
    problemStatement: `
      <p>Hand-pump and solar boreholes serve as the primary water source
      across rural chiefdoms. A pump that breaks down on a Friday can stay
      broken for weeks; the district maintenance team has no visibility
      until a community escalates.</p>
      <p>A low-power flow + voltage sensor, paired with a maintenance
      ticketing flow, could close the loop. The Roadmap stages a pilot in
      two chiefdoms before any regional rollout.</p>
    `,
    sector: 'Infrastructure',
    urgency: 'high',
    origin: 'research',
    publishedAt: '2026-05-22',
    kitUrl: 'https://github.com/christex-foundation/borehole-uptime-starter',
    demoUrl: 'https://borehole-uptime-demo.vercel.app',
    infographicUrl: null,
    builders: [],
  },
  {
    id: 'lib-off-grid-study',
    slug: 'off-grid-study-tools',
    title: 'Off-grid study tools for exam season',
    problemStatement: `
      <p>WASSCE candidates lose the last six weeks of revision to
      load-shedding. Printed materials are scarce, expensive, and rarely
      tuned to the syllabus. The disadvantage compounds for rural students
      already at the edge of the testing system.</p>
      <p>A solar-charged, single-purpose study device — or a phone-based
      pack that runs without data — could change the geography of the exam.
      The User Flows document considers both form factors.</p>
    `,
    sector: 'Education',
    urgency: 'medium',
    origin: 'community',
    publishedAt: '2026-05-24',
    kitUrl: null,
    demoUrl: null,
    infographicUrl: null,
    builders: [
      {
        id: 'b8',
        userId: 'u-aminata',
        name: 'Aminata Sankoh',
        githubUrl: 'https://github.com/asankoh',
        repoUrl: null,
        registeredAt: '2026-05-25',
      },
    ],
  },
  {
    id: 'lib-solar-accounting',
    slug: 'community-solar-accounting',
    title: 'Community-scale solar accounting',
    problemStatement: `
      <p>Mini-grids serve a few dozen households at a time. Operators
      track consumption and arrears in spiral notebooks; disputes follow,
      and trust frays. The model only scales with cleaner books.</p>
      <p>A small POS-style meter app, designed for an operator with a
      single phone, could carry the ledger reliably. The PRD identifies
      arrears workflows and dispute resolution as the hardest surface.</p>
    `,
    sector: 'Energy',
    urgency: 'medium',
    origin: 'research',
    publishedAt: '2026-05-25',
    kitUrl: 'https://github.com/christex-foundation/solar-accounting-starter',
    demoUrl: null,
    infographicUrl: null,
    builders: [
      {
        id: 'b9',
        userId: 'u-saidu',
        name: 'Saidu Mansaray',
        githubUrl: 'https://github.com/smansaray',
        repoUrl: 'https://github.com/smansaray/solar-ledger',
        registeredAt: '2026-05-25',
      },
    ],
  },
];
