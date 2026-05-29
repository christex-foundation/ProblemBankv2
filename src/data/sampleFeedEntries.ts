import type { DisplayStatus, UrgencyKey } from '@/lib/enums';

/**
 * @deprecated Superseded by `getFeedEntries()` / `getFeedEntryById()` in
 * `src/lib/feed.ts`. Real submissions are now read from Supabase. This file
 * is kept temporarily so the type alias `FeedEntry = SampleFeedEntry` in
 * `src/lib/feed.ts` continues to compile; safe to delete once nothing else
 * imports it.
 */
export interface SampleFeedEntry {
  id: string;
  title: string;
  /** Plain-text preview; one to three sentences. */
  body: string;
  sector: string;
  urgency: UrgencyKey;
  status: DisplayStatus;
  voteCount: number;
  commentCount: number;
  authorName: string;
  authorLocation: string;
  submittedAt: string;
  comments?: SampleFeedComment[];
}

export interface SampleFeedComment {
  id: string;
  authorName: string;
  authorLocation?: string;
  body: string;
  createdAt: string;
  /** Author name this comment is replying to. Rendered as an @mention prefix. */
  replyToName?: string;
  /** Nested replies. Two levels of nesting are supported by the design. */
  replies?: SampleFeedComment[];
  upvoteCount?: number;
}

/**
 * @deprecated No longer rendered. See `SampleFeedEntry`.
 */
export const SAMPLE_FEED_ENTRIES: SampleFeedEntry[] = [
  {
    id: 'fd-clinic-stockouts',
    title: 'District health offices have no real-time view of clinic stockouts',
    body: 'Nurses call the district pharmacist on personal phones to flag a missing drug. By the time the call is logged, the next requisition has already shipped. We need a lightweight dashboard that surfaces stockouts within 24 hours of a clinic flagging them, even on a feature phone.',
    sector: 'Health',
    urgency: 'critical',
    status: 'gaining_traction',
    voteCount: 47,
    commentCount: 12,
    authorName: 'Aminata Kamara',
    authorLocation: 'Bo',
    submittedAt: '2026-05-18',
    comments: [
      {
        id: 'cm-clinic-1',
        authorName: 'Dr. Foday Bangura',
        authorLocation: 'Kenema',
        body: 'We tried a WhatsApp group for this last year. It worked for a month, then the focal-point nurse rotated out and nobody adopted it. Whatever ships needs to survive staff turnover.',
        createdAt: '2026-05-19',
        upvoteCount: 8,
      },
      {
        id: 'cm-clinic-2',
        authorName: 'Mariama Sesay',
        authorLocation: 'Bo',
        body: 'Feature-phone first matters here. Most of our community health workers are on KaiOS or basic Nokias. SMS or a USSD code would beat any app.',
        createdAt: '2026-05-20',
        upvoteCount: 14,
        replies: [
          {
            id: 'cm-clinic-2-r1',
            authorName: 'Dr. Foday Bangura',
            authorLocation: 'Kenema',
            body: 'Agreed. We piloted a USSD prototype in 2024 with the IRC; coverage was excellent but the menu depth killed completion rates. Two-step max.',
            createdAt: '2026-05-21',
            replyToName: 'Mariama Sesay',
            upvoteCount: 5,
            replies: [
              {
                id: 'cm-clinic-2-r1-r1',
                authorName: 'Mariama Sesay',
                authorLocation: 'Bo',
                body: 'Two-step is the magic number in our retraining sessions too. Anything beyond that and the nurse hangs up before the confirm.',
                createdAt: '2026-05-21',
                replyToName: 'Dr. Foday Bangura',
                upvoteCount: 2,
              },
            ],
          },
          {
            id: 'cm-clinic-2-r2',
            authorName: 'Aminata Kamara',
            authorLocation: 'Bo',
            body: 'Could the broadcast go the other way too? SMS to the caretaker when a similar clinic flags the same shortage, so they can pre-empt.',
            createdAt: '2026-05-22',
            replyToName: 'Mariama Sesay',
            upvoteCount: 3,
          },
        ],
      },
      {
        id: 'cm-clinic-3',
        authorName: 'Abu Kargbo',
        authorLocation: 'Freetown',
        body: 'DHIS2 already collects stockout data monthly. The gap is latency, not capture. If this hooks into DHIS2 with daily writes it would be much easier to land with the Ministry.',
        createdAt: '2026-05-22',
        upvoteCount: 6,
        replies: [
          {
            id: 'cm-clinic-3-r1',
            authorName: 'Christex Foundation',
            authorLocation: 'Freetown',
            body: 'This is the read we keep landing on too. The DHIS2 API supports per-event writes; the question is whether the Ministry will open that endpoint for a non-state caller. Following up.',
            createdAt: '2026-05-23',
            replyToName: 'Abu Kargbo',
            upvoteCount: 4,
          },
        ],
      },
    ],
  },
  {
    id: 'fd-study-tools',
    title: 'Off-grid study tools for exam season',
    body: 'WAEC season hits at the same time as the worst load-shedding of the year. Students lose the last six weeks of revision because phones die and printed past papers run out. A shareable, offline-first study pack across SS3 subjects would change pass rates outside the urban centres.',
    sector: 'Education',
    urgency: 'high',
    status: 'gaining_traction',
    voteCount: 33,
    commentCount: 8,
    authorName: 'Mohamed Sesay',
    authorLocation: 'Makeni',
    submittedAt: '2026-05-14',
    comments: [
      {
        id: 'cm-study-1',
        authorName: 'Isatu Conteh',
        authorLocation: 'Makeni',
        body: 'Past papers and marking schemes for the last five WAEC cycles would be enough on its own. Students compile these by hand right now.',
        createdAt: '2026-05-15',
      },
      {
        id: 'cm-study-2',
        authorName: 'Patrick Kamara',
        authorLocation: 'Freetown',
        body: 'Whatever the format, it has to work without data. Even Freetown students burn through bundles fast in exam season.',
        createdAt: '2026-05-17',
      },
    ],
  },
  {
    id: 'fd-post-harvest',
    title: 'Post-harvest loss tracking for smallholder cooperatives',
    body: 'Co-ops we work with in Kenema lose 25–40% of rice between threshing and the wholesale buyer. There is no shared ledger; every farmer estimates from memory. A simple intake log on a shared phone could give the cooperative a real number to negotiate against.',
    sector: 'Agriculture',
    urgency: 'high',
    status: 'under_review',
    voteCount: 28,
    commentCount: 14,
    authorName: 'Fatmata Bangura',
    authorLocation: 'Kenema',
    submittedAt: '2026-05-12',
    comments: [
      {
        id: 'cm-harvest-1',
        authorName: 'Sento Mansaray',
        authorLocation: 'Kenema',
        body: 'Our co-op in Lower Bambara would pilot this tomorrow. We already weigh at intake; we just write the number in a book that gets lost.',
        createdAt: '2026-05-13',
      },
      {
        id: 'cm-harvest-2',
        authorName: 'Christex Foundation',
        authorLocation: 'Freetown',
        body: 'Picking this up under review. Question for the room: is the right unit the cooperative, the farmer, or the individual lot? That shapes the whole data model.',
        createdAt: '2026-05-21',
        replies: [
          {
            id: 'cm-harvest-2-r1',
            authorName: 'Fatmata Bangura',
            authorLocation: 'Kenema',
            body: 'Lot, with farmer and cooperative as derived rollups. The cooperative pays out per lot already, so the books are tied to that unit, not the person.',
            createdAt: '2026-05-22',
            replyToName: 'Christex Foundation',
          },
        ],
      },
    ],
  },
  {
    id: 'fd-feeder-roads',
    title: 'Rainy-season routing for feeder roads',
    body: 'Trucks heading to Pujehun in July work off WhatsApp screenshots of which feeder roads are passable. The Ministry has a map but it updates every two weeks. A simple driver-reported "open/closed" toggle by road segment, refreshed daily, would save days of stranded inventory.',
    sector: 'Logistics',
    urgency: 'critical',
    status: 'submitted',
    voteCount: 22,
    commentCount: 6,
    authorName: 'Ibrahim Conteh',
    authorLocation: 'Freetown',
    submittedAt: '2026-05-20',
    comments: [
      {
        id: 'cm-roads-1',
        authorName: 'Musa Kallon',
        authorLocation: 'Pujehun',
        body: 'The chiefdom council in Sowa already keeps a paper log. The problem is nobody outside the village sees it until the road dries out.',
        createdAt: '2026-05-21',
      },
      {
        id: 'cm-roads-2',
        authorName: 'Adama Sankoh',
        authorLocation: 'Bo',
        body: 'Could the bike-courier network feed this? They are the ones who find out first when a bridge gives.',
        createdAt: '2026-05-22',
      },
    ],
  },
  {
    id: 'fd-mobile-money',
    title: 'Mobile-money liquidity at month-end',
    body: 'Agents in Kambia run out of float by the 28th every month. Customers either walk away or accept worse rates from informal traders. A regional liquidity-rebalancing signal — even just an SMS broadcast to nearby agents — would keep transactions moving.',
    sector: 'Finance',
    urgency: 'high',
    status: 'submitted',
    voteCount: 19,
    commentCount: 5,
    authorName: 'Hawa Turay',
    authorLocation: 'Kambia',
    submittedAt: '2026-05-21',
    comments: [
      {
        id: 'cm-money-1',
        authorName: 'Foday Bah',
        authorLocation: 'Kambia',
        body: 'Agents would share float across the border with Guinea informally if there were any signal. The 28th is the same for Orange and Africell, so the squeeze is regional.',
        createdAt: '2026-05-22',
      },
      {
        id: 'cm-money-2',
        authorName: 'Beatrice Lebbie',
        authorLocation: 'Freetown',
        body: 'Worth talking to the MNO ops teams first. They have agent-level liquidity data already; the gap might be a permission to share it, not a tool to surface it.',
        createdAt: '2026-05-23',
      },
    ],
  },
  {
    id: 'fd-borehole-uptime',
    title: 'Borehole uptime monitoring for community water points',
    body: 'A third of installed boreholes in the Western Area Rural District are broken at any given moment, but nobody knows which third. Communities walk further; NGOs keep drilling new ones. A monthly check-in from the local caretaker, logged on a shared register, would tell us where to repair before we drill.',
    sector: 'Infrastructure',
    urgency: 'medium',
    status: 'research_in_progress',
    voteCount: 17,
    commentCount: 9,
    authorName: 'Sallieu Jalloh',
    authorLocation: 'Waterloo',
    submittedAt: '2026-05-08',
    comments: [
      {
        id: 'cm-borehole-1',
        authorName: 'Tenneh Kanu',
        authorLocation: 'Waterloo',
        body: 'Our chiefdom has a caretaker for each borehole; the role exists, the reporting does not. Even a quarterly check-in would beat what we have.',
        createdAt: '2026-05-09',
      },
      {
        id: 'cm-borehole-2',
        authorName: 'Christex Foundation',
        authorLocation: 'Freetown',
        body: 'Research underway. We are mapping which districts have caretaker registries already so we know what to integrate with versus build new.',
        createdAt: '2026-05-15',
      },
    ],
  },
  {
    id: 'fd-solar-accounting',
    title: 'Community-scale solar accounting',
    body: 'Six villages outside Kabala share a solar mini-grid. Right now the operator tracks payments in a notebook and chases unpaid bills door-to-door. A simple usage-and-payment ledger keyed to each household would cut collection time in half and make the grid investable.',
    sector: 'Energy',
    urgency: 'medium',
    status: 'submitted',
    voteCount: 14,
    commentCount: 3,
    authorName: 'Joseph Koroma',
    authorLocation: 'Kabala',
    submittedAt: '2026-05-22',
    comments: [
      {
        id: 'cm-solar-1',
        authorName: 'Memuna Sankoh',
        authorLocation: 'Kabala',
        body: 'If this is built, the same ledger could serve our four neighbouring villages with very little change. We share the operator already.',
        createdAt: '2026-05-23',
      },
    ],
  },
  {
    id: 'fd-birth-cert',
    title: 'Birth-certificate registration access in rural chiefdoms',
    body: 'Parents lose a full day of work to travel to a registry office that may or may not have forms in stock that week. The records exist on paper at the chiefdom level — the gap is between the paper record and the national database.',
    sector: 'Other',
    urgency: 'high',
    status: 'submitted',
    voteCount: 11,
    commentCount: 4,
    authorName: 'Adama Mansaray',
    authorLocation: 'Port Loko',
    submittedAt: '2026-05-19',
    comments: [
      {
        id: 'cm-birth-1',
        authorName: 'Sheku Tarawalie',
        authorLocation: 'Port Loko',
        body: 'The paramount chief in Lokomasama keeps the registry in a locked cabinet. Digitising at the chiefdom level, not the registry level, is the unlock.',
        createdAt: '2026-05-20',
      },
      {
        id: 'cm-birth-2',
        authorName: 'Hassanatu Conteh',
        authorLocation: 'Freetown',
        body: 'Worth coordinating with the National Civil Registration Authority directly; they have a digitisation plan that has been stalled for years.',
        createdAt: '2026-05-21',
      },
    ],
  },
  {
    id: 'fd-streetlight',
    title: 'Streetlight fault reporting in the city centre',
    body: 'Half the streetlights in central Freetown stay broken for months because the EDSA reporting line is rarely staffed. A simple shortcode or WhatsApp bot that geotags a fault and routes it to the right maintenance crew would close the loop.',
    sector: 'Infrastructure',
    urgency: 'low',
    status: 'submitted',
    voteCount: 8,
    commentCount: 2,
    authorName: 'Zainab Williams',
    authorLocation: 'Freetown',
    submittedAt: '2026-05-23',
    comments: [
      {
        id: 'cm-street-1',
        authorName: 'Augustine Pratt',
        authorLocation: 'Freetown',
        body: 'EDSA already has a fault-ticket system internally; the friction is that the public has no way in. A shortcode would close that loop without needing new infrastructure on their side.',
        createdAt: '2026-05-24',
      },
    ],
  },
  {
    id: 'fd-vaccine-cold-chain',
    title: 'Cold-chain logger for vaccines headed to the islands',
    body: 'Vaccines reach the Bonthe island chiefdoms after a four-to-seven-hour boat ride. Nurses estimate one in five vials arrives compromised, but there is no record of when the chain broke. A US$15 logger paired with a handover app would let the district trace spoilage to a specific leg of the journey.',
    sector: 'Health',
    urgency: 'critical',
    status: 'live',
    voteCount: 6,
    commentCount: 18,
    authorName: 'Christex Foundation',
    authorLocation: 'Bonthe',
    submittedAt: '2026-04-02',
    comments: [
      {
        id: 'cm-cold-1',
        authorName: 'Nurse Aminata Kallon',
        authorLocation: 'Bonthe',
        body: 'We piloted the logger on three runs in April. The handover app caught a four-hour gap at the Mattru jetty we never would have flagged on paper.',
        createdAt: '2026-04-15',
      },
      {
        id: 'cm-cold-2',
        authorName: 'Dr. Mohamed Bah',
        authorLocation: 'Freetown',
        body: 'EPI team at the Ministry has asked for the dataset from the pilot to inform their next national procurement cycle. Strong signal that this is generalisable.',
        createdAt: '2026-04-28',
      },
    ],
  },
];
