// Data + digest copy for the Community Needs Assessment report (April 2026).
// Numbers are taken from the source report's figures; this drives the bespoke
// scroll-digest detail page at /library/community-needs-assessment.

export type Bar = { label: string; value: number; accent?: boolean };

export const report = {
  slug: 'community-needs-assessment',
  eyebrow: 'Christex Foundation · Freetown',
  title: 'Community Survey 2026',
  status: 'Preliminary report · First findings',
  date: 'April 2026',
  base: 609,
  lede:
    'Findings on living conditions and priorities across four Freetown communities, with a separate look at Fourah Bay College.',

  // The four cover stats.
  headline: [
    { key: 'Water', stat: '~7 in 10', note: 'named water or sanitation, every group' },
    { key: 'Top ask', stat: 'Skills, jobs', note: 'skills 65% · jobs 55%' },
    { key: 'Hardest hit', stat: 'Kroobay', note: 'deepest trouble, broadest need' },
    { key: 'The caveat', stat: 'Trust', note: 'thin, and it was earned' },
  ],

  sample: {
    total: 609,
    under36: '≈ ⅔',
    genderSplit: '53 / 47',
    communities: 476,
    students: 97,
    campus: 36,
  },

  method: {
    paragraphs: [
      'It rests on two sources: a survey of 609 people across the communities, and early group conversations with community leaders.',
      'Communities were chosen for their range of size, location and conditions. Within each, field teams worked through different sections (residential areas, markets and transport points), approaching people systematically rather than only those easiest to reach, and aiming for a spread across gender, age and occupation. Of 615 forms collected, 6 were set aside as ambiguous, leaving 609.',
      'Field teams surveyed residents in April 2026 using one questionnaire in English and Krio, covering demographics, problems, current coping, the support people want, their top priority, and what would stop them using a new service. Six enumerators collected the bulk of responses. Most questions allowed multiple answers, so percentages sum to more than 100.',
    ],
    note: 'The support question’s preset options did not include infrastructure. That demand is captured instead through the free-text answers analysed later in this report.',
    record: [
      { k: 'Field work', v: 'April 2026' },
      { k: 'Languages', v: 'English & Krio' },
      { k: 'Enumerators', v: '6' },
      { k: 'Collected', v: '615 forms' },
      { k: 'Valid', v: '609' },
    ],
    asked: [
      'Demographics',
      'Problems',
      'Current coping',
      'Support wanted',
      'Top priority',
      'Barriers to use',
    ],
    sources: [
      { tag: 'A', label: 'Survey', detail: '609 people across the communities' },
      { tag: 'B', label: 'Conversations', detail: 'early group talks with community leaders' },
    ],
    composition: [
      { label: 'Four communities', value: 476 },
      { label: 'FBC students', value: 97 },
      { label: 'On-campus residents', value: 36 },
    ],
  },

  // FIGURE 1 — problems named vs support requested (four communities, n=476).
  problemsNamed: [
    { label: 'Water or sanitation', value: 68 },
    { label: 'Drug / substance abuse', value: 56 },
    { label: 'Unemployment', value: 45 },
    { label: 'Insecurity', value: 30 },
    { label: 'Poor healthcare', value: 22 },
    { label: 'Poverty', value: 22 },
    { label: 'Poor education', value: 17 },
    { label: 'Gender-based violence', value: 16 },
    { label: 'Mental health', value: 11 },
  ] as Bar[],
  supportRequested: [
    { label: 'Skills training', value: 65 },
    { label: 'Job opportunities', value: 55 },
    { label: 'Business / financial', value: 44 },
    { label: 'Youth programs', value: 26 },
    { label: 'Education support', value: 25 },
    { label: 'Women & girls support', value: 22 },
    { label: 'Health services', value: 21 },
    { label: 'Information / awareness', value: 18 },
    { label: 'Mental health support', value: 14 },
    { label: 'Water, sanitation & waste', value: 11, accent: true },
    { label: 'Electricity / power', value: 7, accent: true },
  ] as Bar[],

  // FIGURE 2 — the chain residents described, unprompted.
  waterChain: {
    steps: ['Water is far and scarce', 'Hours spent fetching, often at night'],
    outcomes: [
      'Lost school & study time',
      'Lost trading income & jobs',
      'Girls exposed to harm at night',
    ],
    quotes: [
      { text: 'The time used to study is what they spend on searching for water.', who: 'Resident · Aberdeen' },
      { text: 'Most of our girls wake at midnight to fetch water.', who: 'Resident · Aberdeen' },
      { text: 'Because of the lack of a water facility, our children are getting pregnant.', who: 'Resident · Grafton' },
    ],
  },

  // FIGURE 3 — problem prevalence within each community (% within community).
  communityProblems: {
    categories: ['Water', 'Drug abuse', 'Unemployment', 'Insecurity', 'Poor health', 'GBV', 'Mental health'],
    series: [
      { name: 'Fourah Bay', n: 116, values: [64, 68, 59, 32, 16, 20, 12] },
      { name: 'Grafton', n: 126, values: [77, 39, 33, 20, 25, 8, 6] },
      { name: 'Kroobay', n: 118, values: [66, 65, 43, 39, 32, 23, 16], highlight: true },
      { name: 'Aberdeen', n: 116, values: [64, 52, 44, 30, 14, 13, 9] },
    ],
  },

  // FIGURE 4 — infrastructure asked for in free-text (% of 118 who wrote one in).
  freeText: [
    { label: 'Water & sanitation', value: 43, count: 51 },
    { label: 'Electricity / power', value: 30, count: 35 },
    { label: 'Roads & transport', value: 9, count: 11 },
    { label: 'Housing / shelter', value: 7, count: 8 },
  ],

  // FIGURE 5 — FBC students vs marginalised communities, problems named.
  // Ordered to lead with the students' standout (poor health) right after water.
  studentsVsCommunities: {
    categories: ['Water', 'Poor health', 'Drug abuse', 'Unemployment', 'Insecurity', 'GBV'],
    series: [
      { name: 'Marginalised communities', n: 476, values: [68, 22, 56, 45, 30, 16] },
      { name: 'FBC university students', n: 97, values: [69, 35, 13, 18, 11, 3], highlight: true },
    ],
  },

  // SECTION 05 — the college as a separate audience. Dek + two callouts that
  // read the bubble matrix (same shape as the by-community notes).
  students: {
    eyebrow: 'Section 05 · FBC students',
    title: 'The college is a separate story.',
    dek: 'Students at Fourah Bay College were surveyed alongside the communities but are not one. They live across different settings, and their profile is distinct. They share the water problem (it tops their list too) but very little else.',
    notes: [
      {
        headline: 'Health is their second problem, not drugs.',
        color: 'bg-accent',
        body: 'Poor healthcare lands at 35% for students, well above the communities at 22%. Drug abuse, unemployment, insecurity and GBV all fall away sharply once you leave the communities.',
      },
      {
        headline: 'Their asks point to work and staying well.',
        color: 'bg-foreground/80',
        body: 'Support follows the same logic as the communities, jobs and skills, but with health services close behind at 36% against 20%. A population that is housed and schooled, worried about staying well and finding work after study.',
      },
    ],
    quotes: [
      { text: 'For people to be healthy they need a good health facility.', who: 'FBC student' },
      { text: 'We have tanks for storage but no water in them.', who: 'FBC campus resident (n=36)' },
      {
        text: 'We are carrying bundles of water on our heads: there is no road for a motorcycle or car to enter.',
        who: 'FBC campus resident',
      },
    ],
  },

  // FIGURE 6 — barriers to using a new service (mentions across responses).
  barriers: [
    { label: 'Cost', value: 253, accent: true },
    { label: 'Lack of information', value: 199 },
    { label: 'Trust', value: 114 },
    { label: 'Distance', value: 111 },
    { label: 'Time', value: 69 },
    { label: 'Fear', value: 57 },
  ] as Bar[],

  // SECTION 06 — barriers & trust. The reading beside the bars, the voices
  // that carry it, and the closing warning rendered as a coral callout.
  trust: {
    intro:
      'The written answers return again and again to one point: help has come before and not lasted. In Grafton this is sharpest, where an NGO resettled the community and then withdrew, leaving people to carry on alone. That memory now shapes what residents said would stop them trusting or using a new service.',
    quotes: [
      {
        text: 'This community was given relief by an NGO and was left to make developments themselves.',
        who: 'Resident · Grafton',
      },
      {
        text: 'Trust, because previous organizations have asked the same questions.',
        who: 'Resident · Grafton',
      },
      {
        text: 'People constantly come, take our information for data, disappear, and nothing ever changes.',
        who: 'Leader · Grafton / Polio Community',
      },
    ],
    warning: {
      eyebrow: 'The clearest warning in the data',
      body: 'A resident named the survey itself as grounds for distrust: other organisations asked the same questions and nothing followed. Anyone acting on this report should assume people are measuring them against a history of being left.',
    },
  },

  // SECTION 07 — preferred way to be reached.
  reach: [
    { label: 'Community meetings', value: 71, accent: true },
    { label: 'Social media', value: 37 },
    { label: 'Radio', value: 28 },
    { label: 'In-person centres', value: 24 },
    { label: 'Phone / WhatsApp', value: 16 },
  ] as Bar[],

  // SECTION 02b — leader conversations. Small group talks that put texture
  // behind the survey counts. Bodies are segment arrays so key phrases can be
  // marked inline. Directional, not representative (see note).
  leaderConversations: {
    eyebrow: 'Leader conversations',
    title: 'Conversations with community leaders put detail behind these numbers.',
    note: 'These were small group discussions, a handful of chiefs, councillors, market and traditional leaders in each community, so they are directional rather than representative. But they describe what the survey could only count.',
    entries: [
      {
        community: 'Aberdeen',
        body: [
          'Leaders described hunger and the absence of work pushing young women into ',
          { mark: 'survival sex work' },
          ', framed as desperation rather than choice, with women wanting a way out. They also reported police and local authorities seizing female traders’ goods under the banner of keeping order, and ',
          { mark: 'no public toilets' },
          ', forcing people to use the sea.',
        ],
      },
      {
        community: 'Grafton & Polio Community',
        body: [
          'The sharpest issue was the ',
          { mark: 'exclusion of disabled residents' },
          ': amputees and polio survivors pushed aside at water pumps by able-bodied people, and broken roads trapping mobility-impaired residents at home through the rainy season, ',
          { mark: 'cut off from medical care' },
          '.',
        ],
      },
      {
        community: 'Kroobay',
        body: [
          'The water problem is also one of ',
          { mark: 'flooding and sanitation' },
          ': poor drainage that leaves water standing in the rains, and public toilets shared between ',
          { mark: 'far too many households' },
          '.',
        ],
      },
    ] as Array<{ community: string; body: Array<string | { mark: string }> }>,
  },

  // SECTION 04 — leader proposals. What community leaders actually asked to
  // be built, grouped into three pitches. Bodies are segment arrays so key
  // phrases can be marked inline (same treatment as leaderConversations).
  leaderProposals: {
    eyebrow: 'Section 04 · Leader proposals',
    title: 'What communities propose.',
    note: 'Their proposals were practical, specific, and consistent across very different places.',
    entries: [
      {
        heading: 'Infrastructure, built to last',
        body: [
          'Most communities asked first for ',
          { mark: 'permanent boreholes' },
          ' for clean daytime water, to end the night-time fetching that drives so much else. In Kroobay the emphasis fell instead on drainage, waste and flooding. Alongside this: ',
          { mark: 'solar lighting over water points' },
          ', named repeatedly to protect women and girls collecting after dark; managed community latrines to stop open and sea toilet use; and road repairs to restore access cut off in the rains.',
        ],
      },
      {
        heading: 'Reaching the people usually missed',
        body: [
          'Grafton’s leaders pressed for direct, ',
          { mark: 'house-to-house delivery' },
          ' of water and resources to disabled households, so that amputees and polio survivors are not forced to compete at the pump. Aberdeen’s leaders wanted ',
          { mark: 'economic alternatives' },
          ' aimed squarely at young women in survival sex work (skills training, grants and safety nets), and protection for female traders from the loss of their goods.',
        ],
      },
      {
        heading: 'Earn trust before doing anything',
        body: [
          'In communities most let down before, leaders set conditions. Grafton’s asked that a project openly ',
          { mark: 'acknowledge the history of abandonment' },
          ' and make only short, guaranteed commitments rather than large promises. Several wanted work routed through respected traditional leaders rather than political channels, to avoid capture. A recurring theme was ',
          { mark: 'self-reliance with light external backing' },
          ': communities organising their own youth taskforces to guard water points and maintain latrines.',
        ],
      },
    ] as Array<{ heading: string; body: Array<string | { mark: string }> }>,
    reachLabel: 'On reach',
    reachNote: [
      'How they want to be reached differs by place.',
      'Most communities favour meetings backed by local radio.',
      'The college population is the exception, preferring social media:',
      'a reminder that a single channel will not reach everyone.',
    ],
  },

  // CLOSING — what the data says to do. Eight calls, each a headline + the
  // reasoning behind it, rendered as a numbered coral thread. Closed by the
  // water-chain note: the one connection that should frame every other call.
  recommendations: [
    {
      headline: 'Water is the priority the communities themselves set, and it holds everywhere, students included.',
      body: 'It is largely a matter of public provision: wells, supply schedules, sanitation, access roads. The useful destination for that finding is the actors who can deliver it: city and water authorities, and WASH organisations.',
    },
    {
      headline: 'The support people ask for is economic, and it is consistent across all four communities.',
      body: 'Skills training, jobs and small-business capital are wanted everywhere, most of all in Kroobay. This is where programmatic response is both possible and asked for.',
    },
    {
      headline: 'Kroobay warrants focused attention.',
      body: 'Its problems are compounded and its demand for help is the broadest. Anyone choosing one place to start has a clear answer.',
      accent: true,
    },
    {
      headline: 'Disabled residents are being left out of even basic access.',
      body: 'In Grafton and the Polio community, amputees and polio survivors are pushed off water points and trapped by broken roads. Any water or aid effort there has to be designed to reach them directly, not assume they can compete for it.',
    },
    {
      headline: 'Any future survey should list infrastructure as a support option.',
      body: 'People wrote it in unprompted; it should be measured directly, not inferred from a blank line.',
    },
    {
      headline: 'Trust has to be earned before anything is built.',
      body: 'Communities let down before asked for honesty about past abandonment and small, kept commitments over large promises. Routing work through respected local figures rather than political channels was a recurring request.',
      accent: true,
    },
    {
      headline: 'The students are a separate audience with a separate need: water and health.',
      body: 'They should not be folded into community programming designed for different problems.',
    },
    {
      headline: 'Whoever acts must plan to stay.',
      body: 'The strongest sentiment in the data is distrust born of organisations that left. A short pilot that ends without follow-through would confirm what residents already expect.',
    },
  ],

  waterChainNote: {
    label: '↳ A note on the water chain',
    body: 'Because water scarcity feeds directly into lost schooling, lost income and risk to girls, any intervention on those fronts that ignores water works against the current. The connections residents drew should sit at the centre of how solutions are designed.',
  },

  // Closing colophon: a two-panel sign-off card. Left reads as the document's
  // methodology footnote; right is the dark report-meta panel with the mark.
  colophon: {
    leftLabel: 'Methodology & base',
    leftBody:
      'Prepared from field data collected by Christex Foundation, April 2026. Survey n = 609; community analysis n = 476 across Fourah Bay, Grafton, Kroobay and Aberdeen; FBC students n = 97; FBC campus residents n = 36. Leader discussions: four group conversations across Aberdeen, FBC, Grafton/Polio and Kroobay.',
    brandLine: 'christex.foundation · Built in Freetown',
    rightLabel: 'A preliminary report',
    rightTitle: ['Early findings', 'Field work: April 2026'],
  },
};
