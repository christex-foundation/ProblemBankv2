import type { ConstellationEntry } from "@/components/LibraryConstellation";

export type { ConstellationEntry };

export const SAMPLE_ENTRIES: ConstellationEntry[] = [
  // Health
  { id: "h1", title: "Rural clinic supply-chain visibility", sector: "Health", urgency: "critical", builders: 12, hasPoc: true },
  { id: "h2", title: "Maternal triage at district level", sector: "Health", urgency: "critical", builders: 4, hasPoc: false },
  { id: "h3", title: "Cold-chain monitoring for vaccines", sector: "Health", urgency: "high", builders: 6, hasPoc: true },
  { id: "h4", title: "Mental health support at scale", sector: "Health", urgency: "high", builders: 2, hasPoc: false },
  { id: "h5", title: "Last-mile pharma delivery", sector: "Health", urgency: "medium", builders: 3, hasPoc: false },
  { id: "h6", title: "Disease outbreak early warning", sector: "Health", urgency: "high", builders: 5, hasPoc: false },
  { id: "h7", title: "Patient-records portability", sector: "Health", urgency: "medium", builders: 1, hasPoc: false },

  // Education
  { id: "e1", title: "Off-grid study tools for exam season", sector: "Education", urgency: "high", builders: 9, hasPoc: true },
  { id: "e2", title: "Teacher retention in rural posts", sector: "Education", urgency: "high", builders: 3, hasPoc: false },
  { id: "e3", title: "Local-language reading materials", sector: "Education", urgency: "medium", builders: 4, hasPoc: false },
  { id: "e4", title: "Out-of-school child outreach", sector: "Education", urgency: "critical", builders: 2, hasPoc: false },
  { id: "e5", title: "Vocational pathways for school leavers", sector: "Education", urgency: "medium", builders: 5, hasPoc: true },

  // Agriculture
  { id: "a1", title: "Post-harvest loss tracking & aggregation", sector: "Agriculture", urgency: "high", builders: 7, hasPoc: true },
  { id: "a2", title: "Price information for farmers at market", sector: "Agriculture", urgency: "medium", builders: 4, hasPoc: false },
  { id: "a3", title: "Climate-resilient seed networks", sector: "Agriculture", urgency: "high", builders: 2, hasPoc: false },
  { id: "a4", title: "Cooperative finance for smallholders", sector: "Agriculture", urgency: "medium", builders: 3, hasPoc: false },

  // Finance
  { id: "f1", title: "Mobile-money liquidity at month-end", sector: "Finance", urgency: "high", builders: 5, hasPoc: true },
  { id: "f2", title: "Micro-credit risk scoring", sector: "Finance", urgency: "medium", builders: 4, hasPoc: false },
  { id: "f3", title: "Cross-border remittance friction", sector: "Finance", urgency: "medium", builders: 2, hasPoc: false },

  // Logistics
  { id: "l1", title: "Rainy-season feeder-road routing", sector: "Logistics", urgency: "critical", builders: 6, hasPoc: false },
  { id: "l2", title: "Inter-city freight matchmaking", sector: "Logistics", urgency: "medium", builders: 3, hasPoc: false },
  { id: "l3", title: "Last-mile parcel delivery in dense markets", sector: "Logistics", urgency: "medium", builders: 4, hasPoc: true },
  { id: "l4", title: "Port-to-warehouse customs visibility", sector: "Logistics", urgency: "high", builders: 1, hasPoc: false },

  // Energy
  { id: "en1", title: "Community-scale solar accounting", sector: "Energy", urgency: "high", builders: 4, hasPoc: true },
  { id: "en2", title: "Grid-failure backup coordination", sector: "Energy", urgency: "high", builders: 2, hasPoc: false },

  // Infrastructure
  { id: "i1", title: "Maintenance registry for public assets", sector: "Infrastructure", urgency: "medium", builders: 3, hasPoc: false },
  { id: "i2", title: "Borehole uptime monitoring", sector: "Infrastructure", urgency: "high", builders: 5, hasPoc: true },
  { id: "i3", title: "Streetlight fault reporting", sector: "Infrastructure", urgency: "low", builders: 2, hasPoc: false },

  // Other
  { id: "o1", title: "Birth-certificate registration access", sector: "Other", urgency: "high", builders: 3, hasPoc: false },
  { id: "o2", title: "Civic complaints triage", sector: "Other", urgency: "medium", builders: 1, hasPoc: false },
];
