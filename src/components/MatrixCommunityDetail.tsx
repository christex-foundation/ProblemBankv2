"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Universe as U, UniverseNode } from "@/lib/universe";
import type { Problem } from "@/lib/types";
import { CATEGORY_COLOR, PROBLEM_CATEGORY } from "@/lib/categories";
import { slugifyProblem } from "@/lib/problemSlugs";
import { ACUTE_COLOR, AcuteArc } from "./AcuteArc";
import { MapUniverse } from "./MapUniverse";
import { MatrixMapToggle, type ViewMode } from "./MatrixMapToggle";
import { MAP_LABELS } from "@/lib/communities";

interface MatrixCommunityDetailProps {
  problem: Problem;
  community: string;
  universe: U;
  mapUniverse: U;
}

const SHORT_PROBLEM: Record<string, string> = {
  "Water or sanitation problems": "WATER & SANITATION",
  "Drug or substance abuse": "DRUG ABUSE",
  "Mental health challenges": "MENTAL HEALTH",
  "Gender-based violence": "GENDER VIOLENCE",
  "Poor healthcare": "HEALTHCARE",
  "Poor education": "EDUCATION",
  Unemployment: "UNEMPLOYMENT",
  Poverty: "POVERTY",
  Insecurity: "INSECURITY",
  Other: "OTHER",
};

interface Slice {
  id: string;
  label: string;
  count: number;
  acute: number;
}

interface Voice {
  respondentId: string;
  gender: string;
  ageBand: string;
  occupation: string;
  topPriorityText: string;
  whyUrgent: string;
  acute: boolean;
  /** True when the displayed quote contains a keyword for this problem.
   * False when we fell back to a more general field because no on-topic
   * snippet existed for that respondent. */
  onTopic: boolean;
}

function buildVoices(
  universe: U,
  problem: Problem,
  community: string,
): Voice[] {
  // Include every respondent who flagged this problem in this community.
  // Prefer the on-topic snippet (voiceQuote) when the build script found one;
  // otherwise fall back to their whyUrgent / topPriorityText so the slice
  // still surfaces ALL respondents, even when their answer doesn't contain
  // an exact keyword match. A drill-down into a small slice should never
  // silently drop the few respondents in it.
  const respMap = new Map<
    string,
    {
      quote: string;
      acute: boolean;
      occupation: string;
      onTopic: boolean;
    }
  >();
  for (const n of universe.nodes) {
    if (n.kind !== "mention") continue;
    if (n.problem !== problem) continue;
    if (n.community !== community) continue;
    const onTopicQuote = (n.voiceQuote || "").trim();
    const fallback = (n.whyUrgent || n.topPriorityText || "").trim();
    const quote =
      onTopicQuote.length >= 20 && onTopicQuote.length <= 360
        ? onTopicQuote
        : fallback.length >= 12 && fallback.length <= 360
          ? fallback
          : "";
    if (!quote) continue;
    const existing = respMap.get(n.respondentId);
    if (!existing || (n.isAcute && !existing.acute)) {
      respMap.set(n.respondentId, {
        quote,
        acute: !!n.isAcute,
        occupation: canonicalOccupation(n.occupation || ""),
        onTopic: !!n.isOnTopic,
      });
    }
  }

  if (respMap.size === 0) return [];

  // Pull the respondent record for demographics.
  const voices: Voice[] = [];
  for (const n of universe.nodes) {
    if (n.kind !== "respondent") continue;
    const hit = respMap.get(n.respondentId);
    if (!hit) continue;
    voices.push({
      respondentId: n.respondentId,
      // Normalize empty gender to "Unknown" so filtering matches the bubble's
      // slice id (which also normalizes to "Unknown" in buildSections).
      gender: (n.gender || "").trim() || "Unknown",
      ageBand: n.ageBand,
      occupation: hit.occupation,
      topPriorityText: (n.topPriorityText || "").trim(),
      whyUrgent: hit.quote, // display the on-topic snippet, not raw whyUrgent
      acute: hit.acute,
      onTopic: hit.onTopic,
    });
  }

  // Sort: acute (their #1) first, then on-topic, then longer quotes lead.
  voices.sort((a, b) => {
    if (a.acute !== b.acute) return a.acute ? -1 : 1;
    if (a.onTopic !== b.onTopic) return a.onTopic ? -1 : 1;
    return b.whyUrgent.length - a.whyUrgent.length;
  });
  return voices.slice(0, 6);
}

interface BubbleSection {
  title: string;
  subtitle: string;
  slices: Slice[];
}

// Sketch order: Male first, Female second, Other below.
const GENDER_ORDER = ["Male", "Female", "Other / Prefer not to say", "Unknown"];
const AGE_ORDER = ["18-25", "26-35", "36-50", "Above 50", "Unknown"];

/** Normalize the messy `occupation` free-text into a small set of buckets. */
function canonicalOccupation(raw: string): string {
  const lo = (raw || "").trim().toLowerCase();
  if (!lo) return "Unknown";
  if (lo.startsWith("student")) return "Student";
  if (lo.startsWith("business")) return "Business";
  if (lo.includes("unemploy") || lo === "no work") return "Unemployed";
  if (lo === "worker" || lo === "laborer" || lo === "labourer") return "Worker";
  if (lo === "trader") return "Trader";
  if (lo === "tailor") return "Tailor";
  if (lo === "house wife" || lo === "housewife") return "Housewife";
  if (lo.startsWith("teach")) return "Teacher";
  if (lo.includes("security")) return "Security officer";
  if (lo.startsWith("farmer")) return "Farmer";
  if (lo.startsWith("driver")) return "Driver";
  // Otherwise: capitalize first letter of the raw value, leave the rest as-is.
  const t = raw.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

interface OccupationStat {
  label: string;
  count: number;
}

function buildOccupationStats(
  universe: U,
  problem: Problem,
  community: string,
  filter: DemoFilter,
): OccupationStat[] {
  // Occupation lives on mention nodes (the build script only added it there).
  // For each unique respondent who flagged this problem × community AND
  // matches the active filter, record their occupation once.
  const occByResp = new Map<string, string>();
  for (const n of universe.nodes) {
    if (n.kind !== "mention") continue;
    if (n.problem !== problem) continue;
    if (n.community !== community) continue;
    const g = (n.gender || "").trim() || "Unknown";
    if (filter.gender !== null && g !== filter.gender) continue;
    if (filter.age !== null && n.ageBand !== filter.age) continue;
    if (occByResp.has(n.respondentId)) continue;
    occByResp.set(
      n.respondentId,
      canonicalOccupation(n.occupation || ""),
    );
  }
  const counts = new Map<string, number>();
  for (const occ of occByResp.values()) {
    counts.set(occ, (counts.get(occ) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

interface DemoFilter {
  gender: string | null;
  age: string | null;
}

const EMPTY_FILTER: DemoFilter = { gender: null, age: null };

function hasAnyFilter(f: DemoFilter): boolean {
  return f.gender !== null || f.age !== null;
}

function buildSections(
  universe: U,
  problem: Problem,
  community: string,
  filter: DemoFilter = EMPTY_FILTER,
): {
  sections: BubbleSection[];
  total: number;
  acute: number;
} {
  // Collect respondents in this community who flagged this problem.
  // A respondent is "acute" for this problem if any of their mentions of it
  // were marked as their top priority (isAcute).
  const respondents = new Map<
    string,
    {
      node: UniverseNode;
      acute: boolean;
    }
  >();

  // First pass: find respondent IDs flagging this problem in this community.
  for (const n of universe.nodes) {
    if (n.kind !== "mention") continue;
    if (n.problem !== problem) continue;
    if (n.community !== community) continue;
    const existing = respondents.get(n.respondentId);
    if (!existing) {
      respondents.set(n.respondentId, {
        node: n,
        acute: !!n.isAcute,
      });
    } else if (n.isAcute) {
      existing.acute = true;
    }
  }

  // Find the canonical respondent node for each (richer demographic fields).
  const canonical = new Map<string, UniverseNode>();
  for (const n of universe.nodes) {
    if (n.kind !== "respondent") continue;
    if (respondents.has(n.respondentId)) canonical.set(n.respondentId, n);
  }

  // Multi-axis filter: a respondent is in the cohort if they pass every
  // active axis (logical AND).
  const matchesFilter = (c: UniverseNode) => {
    if (filter.gender !== null) {
      const g = (c.gender || "").trim() || "Unknown";
      if (g !== filter.gender) return false;
    }
    if (filter.age !== null && c.ageBand !== filter.age) return false;
    return true;
  };

  // Per-section tallies: the section's own axis stays unfiltered (so the user
  // can still see every slice and switch the filter); only the OPPOSITE axis
  // filter narrows the tally. This way, when a gender filter is active, the
  // "By age" bubbles reflect that gender's age split.
  const byGender = new Map<string, { count: number; acute: number }>();
  const byAge = new Map<string, { count: number; acute: number }>();

  const inc = (
    m: Map<string, { count: number; acute: number }>,
    key: string,
    isAcute: boolean,
  ) => {
    let v = m.get(key);
    if (!v) {
      v = { count: 0, acute: 0 };
      m.set(key, v);
    }
    v.count++;
    if (isAcute) v.acute++;
  };

  let total = 0;
  let totalAcute = 0;
  for (const [rid, info] of respondents.entries()) {
    const c = canonical.get(rid) ?? info.node;
    const gender = (c.gender || "").trim() || "Unknown";
    const inCohort = matchesFilter(c);

    // Total + acute reflect the filtered cohort (so the headline numbers
    // shift when a slice is selected).
    if (inCohort) {
      total++;
      if (info.acute) totalAcute++;
    }

    // "By Gender" tally: narrow by the AGE filter only (so users can still
    // switch genders).
    if (filter.age === null || c.ageBand === filter.age) {
      inc(byGender, gender, info.acute);
    }
    // "By age" tally: narrow by the GENDER filter only.
    if (filter.gender === null || gender === filter.gender) {
      inc(byAge, c.ageBand, info.acute);
    }
  }

  const toSlices = (
    m: Map<string, { count: number; acute: number }>,
    order?: string[],
  ): Slice[] => {
    const keys = Array.from(m.keys());
    if (order) {
      keys.sort((a, b) => {
        const ai = order.indexOf(a);
        const bi = order.indexOf(b);
        if (ai === -1 && bi === -1) return (m.get(b)!.count - m.get(a)!.count);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
    } else {
      keys.sort((a, b) => m.get(b)!.count - m.get(a)!.count);
    }
    return keys.map((k) => ({
      id: k,
      label: k,
      count: m.get(k)!.count,
      acute: m.get(k)!.acute,
    }));
  };

  return {
    sections: [
      {
        title: "By Gender",
        subtitle: "who's flagging this problem in this community",
        slices: toSlices(byGender, GENDER_ORDER),
      },
      {
        title: "By age",
        subtitle: "the generational split",
        slices: toSlices(byAge, AGE_ORDER),
      },
    ],
    total,
    acute: totalAcute,
  };
}

// Canvas / zone layout. Each zone has its label as a central anchor sitting
// in the visual gap between bubbles (matches the user's hand-drawn sketch).
//
//   "By Gender" zone — diagonal:    "By age" zone — 2×2:
//     [Male]                          [18-25] [26-35]
//          By Gender                       By age
//             [Female]                [36-50] [Above 50]
//
const VIEW_W = 1200;
const VIEW_H = 660;
const GENDER_CX = 220;
const AGE_CX = 800;
// Age zone is a diamond around the label: 18-25 at top, 26-35 right,
// 36-50 directly under 18-25, Above 50 left.
const AGE_DX = 200; // half-width of the diamond
const AGE_DY = 180; // half-height of the diamond
const GENDER_DX = 55; // diagonal horizontal offset for the gender pair
const GENDER_DY = 150; // diagonal vertical offset for the gender pair
const LABEL_Y = VIEW_H / 2 + 4; // visual centre for both zone labels
const MIN_R = 48;
const MAX_R = 130;
// Age bubbles use a tighter radius so the four diamond points don't
// crowd the central label.
const AGE_MIN_R = 42;
const AGE_MAX_R = 108;

type Placed = Slice & { x: number; y: number; r: number };

function layoutGender(slices: Slice[]): Placed[] {
  if (slices.length === 0) return [];
  const max = Math.max(1, ...slices.map((s) => s.count));
  // First slice upper-left of the label, second lower-right (diagonal).
  // Third (Other) sits below, centered, if present.
  const positions: Array<[number, number]> = [
    [GENDER_CX - GENDER_DX, LABEL_Y - GENDER_DY],
    [GENDER_CX + GENDER_DX, LABEL_Y + GENDER_DY],
    [GENDER_CX, LABEL_Y + GENDER_DY * 1.7],
  ];
  return slices.slice(0, positions.length).map((s, i) => {
    const [x, y] = positions[i];
    const r = MIN_R + Math.sqrt(s.count / max) * (MAX_R - MIN_R);
    return { ...s, x, y, r };
  });
}

function layoutAge(slices: Slice[]): Placed[] {
  if (slices.length === 0) return [];
  const max = Math.max(1, ...slices.map((s) => s.count));
  // Diamond around the central label. 18-25 sits directly above 36-50.
  // Above 50 on the left, 26-35 on the right.
  const positions: Array<[number, number]> = [
    [AGE_CX, LABEL_Y - AGE_DY], // top    · 18-25
    [AGE_CX + AGE_DX, LABEL_Y], // right  · 26-35
    [AGE_CX, LABEL_Y + AGE_DY], // bottom · 36-50 (directly below 18-25)
    [AGE_CX - AGE_DX, LABEL_Y], // left   · Above 50
    [AGE_CX + AGE_DX * 0.7, LABEL_Y + AGE_DY * 1.4], // 5th (Unknown) lower-right
  ];
  return slices.slice(0, positions.length).map((s, i) => {
    const [x, y] = positions[i];
    const r =
      AGE_MIN_R + Math.sqrt(s.count / max) * (AGE_MAX_R - AGE_MIN_R);
    return { ...s, x, y, r };
  });
}

/**
 * Generate a plain-English summary for investors. Two sentences:
 *  1. who, how many, how acute
 *  2. the strongest pattern (gender / age / support)
 */
function cohortLabel(filter: DemoFilter): string {
  // Build a human-readable cohort description from the active filter axes.
  const parts: string[] = [];
  if (filter.gender) parts.push(filter.gender.toLowerCase());
  if (filter.age) parts.push(`aged ${filter.age}`);
  if (parts.length === 0) return "voices";
  if (parts.length === 1 && filter.gender) return `${parts[0]} voices`;
  if (parts.length === 1 && filter.age) return `voices ${parts[0]}`;
  // Both axes active: "male voices aged 26-35"
  return `${filter.gender?.toLowerCase()} voices aged ${filter.age}`;
}

function buildNarrative(
  community: string,
  problemLabel: string,
  sections: BubbleSection[],
  total: number,
  acute: number,
  filter: DemoFilter = EMPTY_FILTER,
): string {
  const filtered = hasAnyFilter(filter);
  if (total === 0) {
    if (filtered) {
      return `No ${community} respondents in the ${cohortLabel(filter)} slice flagged ${problemLabel.toLowerCase()}.`;
    }
    return "";
  }
  const acutePct = Math.round((acute / total) * 100);
  const lower = problemLabel.toLowerCase();

  if (filtered) {
    // When both axes are active, no off-axis pattern to summarise — just
    // state the cohort. When only one axis is active, describe the other.
    const cohort = cohortLabel(filter);
    let phrase = "";
    if (filter.gender !== null && filter.age === null) {
      const age = sections.find((s) => s.title === "By age");
      const top = [...(age?.slices ?? [])].sort((a, b) => b.count - a.count)[0];
      if (top) {
        const share = Math.round((top.count / total) * 100);
        phrase = `Most are aged ${top.label} (${share}%).`;
      }
    } else if (filter.age !== null && filter.gender === null) {
      const gender = sections.find((s) => s.title === "By Gender");
      const top = [...(gender?.slices ?? [])].sort(
        (a, b) => b.count - a.count,
      )[0];
      if (top) {
        const share = Math.round((top.count / total) * 100);
        phrase = `Skews ${top.label.toLowerCase()} (${share}%).`;
      }
    }
    return `${total} ${cohort} in ${community} flagged ${lower} — ${acute} (${acutePct}%) called it their single top priority. ${phrase}`.trim();
  }

  // Unfiltered: describe both gender and age patterns.
  const gender = sections.find((s) => s.title === "By Gender");
  const age = sections.find((s) => s.title === "By age");
  const sortedGender = [...(gender?.slices ?? [])].sort(
    (a, b) => b.count - a.count,
  );
  const topGender = sortedGender[0];
  const secondGender = sortedGender[1];
  const sortedAge = [...(age?.slices ?? [])].sort((a, b) => b.count - a.count);
  const topAge = sortedAge[0];

  let genderPhrase = "";
  if (topGender) {
    if (secondGender && Math.abs(topGender.count - secondGender.count) <= 2) {
      genderPhrase = "Splits nearly evenly between women and men";
    } else {
      const share = Math.round((topGender.count / total) * 100);
      genderPhrase = `Skews ${topGender.label.toLowerCase()} (${share}%)`;
    }
  }
  let agePhrase = "";
  if (topAge) {
    const share = Math.round((topAge.count / total) * 100);
    agePhrase = `peaks in ${topAge.label} (${share}%)`;
  }
  const pattern = [genderPhrase, agePhrase].filter(Boolean).join(", ");
  return `${total} ${community} voices flagged ${lower} — ${acute} (${acutePct}%) called it their single top priority. ${pattern}.`;
}

export function MatrixCommunityDetail({
  problem,
  community,
  universe,
  mapUniverse,
}: MatrixCommunityDetailProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("matrix");
  // Multi-axis filter: each axis is independent. Click Male AND 26-35 to see
  // males aged 26-35. Re-clicking the same bubble releases that axis only.
  const [filter, setFilter] = useState<DemoFilter>(EMPTY_FILTER);
  const filterActive = hasAnyFilter(filter);
  const toggleAxis = (axis: "gender" | "age", value: string) => {
    setFilter((cur) => ({
      ...cur,
      [axis]: cur[axis] === value ? null : value,
    }));
  };
  const clearFilter = () => setFilter(EMPTY_FILTER);

  const { sections, total, acute } = useMemo(
    () => buildSections(universe, problem, community, filter),
    [universe, problem, community, filter],
  );
  // The unfiltered baseline — used for the header "of N total" hint when a
  // filter is active.
  const baseline = useMemo(
    () => buildSections(universe, problem, community, EMPTY_FILTER),
    [universe, problem, community],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const category = PROBLEM_CATEGORY[problem];
  const accent = CATEGORY_COLOR[category];
  const shortLabel = SHORT_PROBLEM[problem] ?? problem.toUpperCase();
  const acutePct = total > 0 ? Math.round((acute / total) * 100) : 0;
  const narrative = useMemo(
    () =>
      buildNarrative(community, shortLabel, sections, total, acute, filter),
    [community, shortLabel, sections, total, acute, filter],
  );
  const voices = useMemo(
    () => buildVoices(universe, problem, community),
    [universe, problem, community],
  );
  const filteredVoices = useMemo(() => {
    return voices.filter((v) => {
      if (filter.gender !== null && v.gender !== filter.gender) return false;
      if (filter.age !== null && v.ageBand !== filter.age) return false;
      return true;
    });
  }, [voices, filter]);

  // Map focus: respondents in this community + problem + matching the active
  // multi-axis demographic filter. Re-derived when filter changes.
  const focusSet = useMemo(() => {
    const matchedIds = new Set<string>();
    for (const n of universe.nodes) {
      if (n.kind !== "mention") continue;
      if (n.problem !== problem) continue;
      if (n.community !== community) continue;
      matchedIds.add(n.respondentId);
    }
    if (filter.gender === null && filter.age === null) return matchedIds;
    const narrowed = new Set<string>();
    for (const n of universe.nodes) {
      if (n.kind !== "respondent") continue;
      if (!matchedIds.has(n.respondentId)) continue;
      const g = (n.gender || "").trim() || "Unknown";
      if (filter.gender !== null && g !== filter.gender) continue;
      if (filter.age !== null && n.ageBand !== filter.age) continue;
      narrowed.add(n.respondentId);
    }
    return narrowed;
  }, [universe, problem, community, filter]);

  // Pre-compute placed bubbles for each zone.
  const genderSection = sections.find((s) => s.title === "By Gender");
  const ageSection = sections.find((s) => s.title === "By age");
  const placedGender = useMemo(
    () => layoutGender(genderSection?.slices ?? []),
    [genderSection],
  );
  const placedAge = useMemo(
    () => layoutAge(ageSection?.slices ?? []),
    [ageSection],
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="px-6 md:px-10 pt-6 md:pt-8 flex items-baseline justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-white/55 flex-wrap">
            <Link href="/matrix" className="hover:text-white transition-colors">
              Matrix
            </Link>
            <span className="text-white/30">›</span>
            <Link
              href={`/matrix/${slugifyProblem(problem)}`}
              className="hover:text-white transition-colors"
            >
              {shortLabel}
            </Link>
            <span className="text-white/30">›</span>
            <span className="text-white">{community.toUpperCase()}</span>
          </div>
          <h1
            className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-white"
          >
            {community} <span style={{ color: accent }}>· {shortLabel.toLowerCase()}</span>
          </h1>
          {narrative && (
            <p className="mt-2 text-[13px] leading-relaxed text-white/80 max-w-[640px]">
              {narrative}
            </p>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <Link
            href={`/matrix/${slugifyProblem(problem)}`}
            className="text-[10px] uppercase tracking-[0.22em] text-white/55 hover:text-white transition-colors"
          >
            ← Back to {shortLabel}
          </Link>
          <MatrixMapToggle mode={viewMode} onChange={setViewMode} />
          <div className="text-right text-[10px] uppercase tracking-[0.18em] flex flex-col gap-1">
            <span className="num font-medium text-white">
              {total} respondents
              {filterActive && (
                <span className="text-white/40">
                  {" "}/ {baseline.total}
                </span>
              )}
            </span>
            <span className="num" style={{ color: ACUTE_COLOR }}>
              {acute} acute · {acutePct}%
            </span>
            {filterActive && (
              <span className="text-white/55 normal-case tracking-normal font-medium">
                slice: {cohortLabel(filter).replace(/ voices( aged)?/, " ").trim() || "all"}
              </span>
            )}
          </div>
        </div>
      </header>

      {viewMode === "map" && (
        <div
          className="px-6 md:px-10 pt-6 pb-6"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 900ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div
            className="w-full max-w-[1500px] mx-auto"
            style={{ aspectRatio: "1400 / 900" }}
          >
            <MapUniverse
              universe={mapUniverse}
              labels={MAP_LABELS}
              focus={focusSet}
              focusProblem={problem}
              theme="dark"
            />
          </div>
        </div>
      )}

      <div
        className="px-6 md:px-10 pt-6 pb-6"
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 900ms cubic-bezier(0.22, 1, 0.36, 1)",
          display: viewMode === "matrix" ? undefined : "none",
        }}
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full max-h-[64vh] block select-none mx-auto"
          role="img"
          aria-label={`Demographic breakdown of ${community} respondents flagging ${shortLabel}`}
        >
          {/* Gender zone — diagonal pair around the central "By Gender" label */}
          <g>
            {placedGender.map((b) => (
              <DemoBubble
                key={`g:${b.id}`}
                b={b}
                /* Section total = sum of THIS section's counts. With an age
                   filter active, this is all genders within that age band,
                   which is the correct denominator for gender share. */
                total={placedGender.reduce((s, x) => s + x.count, 0)}
                hovered={hoverId === `g:${b.id}`}
                otherHovered={hoverId !== null && hoverId !== `g:${b.id}`}
                selected={filter.gender === b.id}
                onEnter={() => setHoverId(`g:${b.id}`)}
                onLeave={() =>
                  setHoverId((cur) => (cur === `g:${b.id}` ? null : cur))
                }
                onClick={() => toggleAxis("gender", b.id)}
              />
            ))}
            {/* Central label — sits in the diagonal gap between the bubbles */}
            <text
              x={GENDER_CX}
              y={LABEL_Y}
              textAnchor="middle"
              fontSize={14}
              fontWeight={500}
              fill="rgba(255,255,255,0.9)"
              className="uppercase pointer-events-none"
              style={{ letterSpacing: "0.22em" }}
            >
              By Gender
            </text>
          </g>

          {/* Vertical divider between the two zones */}
          <line
            x1={(GENDER_CX + GENDER_DX + AGE_CX - AGE_DX) / 2}
            y1={50}
            x2={(GENDER_CX + GENDER_DX + AGE_CX - AGE_DX) / 2}
            y2={VIEW_H - 30}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />

          {/* Age zone — diamond around the central "By age" label */}
          <g>
            {placedAge.map((b) => (
              <DemoBubble
                key={`a:${b.id}`}
                b={b}
                /* Section total = sum of THIS section's counts. With a gender
                   filter active, this is all ages within that gender, which
                   is the correct denominator for age share. */
                total={placedAge.reduce((s, x) => s + x.count, 0)}
                hovered={hoverId === `a:${b.id}`}
                otherHovered={hoverId !== null && hoverId !== `a:${b.id}`}
                selected={filter.age === b.id}
                onEnter={() => setHoverId(`a:${b.id}`)}
                onLeave={() =>
                  setHoverId((cur) => (cur === `a:${b.id}` ? null : cur))
                }
                onClick={() => toggleAxis("age", b.id)}
              />
            ))}
            {/* Central label — sits in the cross of the 2×2 grid */}
            <text
              x={AGE_CX}
              y={LABEL_Y}
              textAnchor="middle"
              fontSize={14}
              fontWeight={500}
              fill="rgba(255,255,255,0.9)"
              className="uppercase pointer-events-none"
              style={{ letterSpacing: "0.22em" }}
            >
              By age
            </text>
          </g>
        </svg>
      </div>

      {total === 0 && (
        <div className="px-6 md:px-10 py-20 flex items-center justify-center text-white/55 text-sm">
          No respondents in {community} flagged {shortLabel.toLowerCase()}.
        </div>
      )}

      {/* Voices — direct words from respondents who named THIS problem as
          their #1 priority. Their whyUrgent answer is on-topic by definition.
          The strongest form of "this is what the problem looks like" we can
          offer an investor. */}
      {voices.length > 0 && (
        <section className="px-6 md:px-10 pt-2 pb-10">
          <div className="border-t border-white/10 pt-6">
            <div className="flex items-baseline justify-between gap-4 mb-1">
              <div>
                <div
                  className="text-[10px] uppercase tracking-[0.22em]"
                  style={{ color: ACUTE_COLOR }}
                >
                  Straight from {community} · in their words
                </div>
                <h2 className="mt-1 text-lg md:text-xl font-semibold tracking-tight">
                  What {community} actually said about{" "}
                  {shortLabel.toLowerCase()}
                  {filterActive && (
                    <span className="text-white/65 font-normal">
                      {" · "}
                      {filter.gender && (
                        <span style={{ color: ACUTE_COLOR }}>
                          {filter.gender}
                        </span>
                      )}
                      {filter.gender && filter.age && (
                        <span className="text-white/40"> + </span>
                      )}
                      {filter.age && (
                        <span style={{ color: ACUTE_COLOR }}>
                          {filter.age}
                        </span>
                      )}
                    </span>
                  )}
                </h2>
                <p className="mt-1 text-[12px] text-white/55 max-w-[640px]">
                  {filterActive ? (
                    <>
                      Filtered to{" "}
                      <span className="text-white font-medium">
                        {[
                          filter.gender,
                          filter.age,
                        ]
                          .filter(Boolean)
                          .join(" + ")}
                      </span>
                      . Click another bubble to add it to the intersection.
                      Click an active bubble (or "clear all") to release.
                    </>
                  ) : (
                    <>
                      Each card is a respondent whose own words mention{" "}
                      {shortLabel.toLowerCase()}. Click a Male / Female / age
                      bubble above to drill into that slice — click both to
                      intersect (e.g. Male + 26-35). The amber strip marks
                      respondents who named it as their{" "}
                      <span className="text-white font-medium">
                        single top priority
                      </span>
                      .
                    </>
                  )}
                </p>
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/45 shrink-0 text-right flex flex-col items-end gap-1">
                <div>
                  <span className="num">{filteredVoices.length}</span> shown
                  {filterActive && (
                    <span className="text-white/35">
                      {" "}/ {voices.length} total
                    </span>
                  )}
                </div>
                <div className="num" style={{ color: ACUTE_COLOR }}>
                  {acute} acute
                </div>
                {filterActive && (
                  <button
                    type="button"
                    onClick={clearFilter}
                    className="text-[10px] uppercase tracking-[0.18em] text-white/55 hover:text-white transition-colors mt-1"
                  >
                    × clear all
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
              {filteredVoices.map((v) => (
                <VoiceCard
                  key={v.respondentId}
                  voice={v}
                  accent={accent}
                  problemLabel={shortLabel.toLowerCase()}
                />
              ))}
            </div>
            {filterActive && filteredVoices.length === 0 && (
              <div className="mt-6 text-[12px] text-white/55 italic">
                No on-topic voices match{" "}
                {[filter.gender, filter.age].filter(Boolean).join(" + ")} for{" "}
                {shortLabel.toLowerCase()} in {community}.
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="px-6 md:px-10 py-6 border-t border-white/10 text-[10px] uppercase tracking-[0.18em] text-white/35 flex justify-between">
        <span>Christex Foundation · Problem Bank</span>
        <span>
          {community} · {problem}
        </span>
      </footer>
    </div>
  );
}

interface DemoBubbleProps {
  b: Placed;
  total: number;
  hovered: boolean;
  otherHovered: boolean;
  selected: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}

function DemoBubble({
  b,
  total,
  hovered,
  otherHovered,
  selected,
  onEnter,
  onLeave,
  onClick,
}: DemoBubbleProps) {
  const sharePct = total > 0 ? Math.round((b.count / total) * 100) : 0;
  // When a filter is active and this bubble isn't the selected one, fade it
  // back. When *this* bubble is selected, lock the hover-style scale-up.
  const scale = selected ? 1.07 : hovered ? 1.07 : 1;
  const opacity = otherHovered ? 0.3 : 1;
  return (
    <g style={{ transform: `translate(${b.x}px, ${b.y}px)` }}>
      <g
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
          transition:
            "transform 400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease",
          opacity,
        }}
      >
        {(hovered || selected) && (
          <>
            <circle
              cx={0}
              cy={0}
              r={b.r + 12}
              fill="none"
              stroke={selected ? ACUTE_COLOR : "rgba(255,255,255,0.18)"}
              strokeOpacity={selected ? 0.22 : 1}
              strokeWidth={12}
              className="pointer-events-none"
            />
            <circle
              cx={0}
              cy={0}
              r={b.r + 4}
              fill="none"
              stroke={selected ? ACUTE_COLOR : "rgba(255,255,255,0.45)"}
              strokeWidth={3}
              className="pointer-events-none"
            />
          </>
        )}
        {[0.78, 0.6, 0.42].map((scale, ringI) => (
          <circle
            key={ringI}
            cx={0}
            cy={0}
            r={b.r * scale}
            fill="none"
            stroke={
              hovered ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.18)"
            }
            strokeWidth={0.5}
            strokeDasharray="2 4"
            style={{ transition: "stroke 240ms ease" }}
          />
        ))}
        <circle
          cx={0}
          cy={0}
          r={b.r}
          fill={
            selected
              ? "rgba(255,180,84,0.06)"
              : hovered
                ? "rgba(255,255,255,0.06)"
                : "transparent"
          }
          stroke={
            selected
              ? ACUTE_COLOR
              : hovered
                ? "rgba(255,255,255,0.95)"
                : "rgba(255,255,255,0.28)"
          }
          strokeWidth={selected || hovered ? 1.6 : 0.8}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          onClick={onClick}
          style={{
            cursor: "pointer",
            transition:
              "stroke 240ms ease, fill 240ms ease, stroke-width 240ms ease",
          }}
        />
        <text
          x={0}
          y={-8}
          textAnchor="middle"
          fontSize={b.r > 90 ? 13 : 11}
          fontWeight={500}
          fill={hovered ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.82)"}
          className="uppercase pointer-events-none"
          style={{
            letterSpacing: "0.12em",
            transition: "fill 240ms ease",
          }}
        >
          {b.label.length > 18 ? b.label.slice(0, 16) + "…" : b.label}
        </text>
        <text
          x={0}
          y={b.r > 80 ? 18 : 14}
          textAnchor="middle"
          fontSize={b.r > 100 ? 30 : b.r > 70 ? 22 : 16}
          fontWeight={300}
          fill="rgba(255,255,255,0.95)"
          className="num pointer-events-none"
        >
          {b.count}
          <tspan
            fontSize={b.r > 100 ? 12 : 10}
            fill="rgba(255,255,255,0.55)"
            dx={5}
          >
            · {sharePct}%
          </tspan>
        </text>
      </g>
    </g>
  );
}

function VoiceCard({
  voice,
  accent,
  problemLabel,
}: {
  voice: Voice;
  accent: string;
  problemLabel: string;
}) {
  // Capitalize the first letter for display (the page passes the short label
  // in lowercase for inline prose use).
  const canonical =
    problemLabel.charAt(0).toUpperCase() + problemLabel.slice(1);
  return (
    <article
      className="relative rounded-md border border-white/10 bg-[#111] p-4 pl-5 overflow-hidden"
    >
      {/* Left edge strip — amber if acute, accent color otherwise */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: voice.acute ? ACUTE_COLOR : accent }}
      />
      <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-white/50">
        <span>
          {voice.gender || "—"} · {voice.ageBand}
        </span>
        {voice.acute && (
          <span
            className="px-1.5 py-0.5 rounded-sm text-[9px] font-medium tracking-[0.18em]"
            style={{
              background: "rgba(255,180,84,0.16)",
              color: ACUTE_COLOR,
            }}
          >
            top priority
          </span>
        )}
      </div>
      {voice.occupation && voice.occupation !== "Unknown" && (
        <div className="mt-1 text-[11px] text-white/65">
          <span className="text-white/40">Occupation · </span>
          {voice.occupation}
        </div>
      )}
      <blockquote className="mt-2 text-[13px] leading-relaxed text-white/85 italic">
        &ldquo;{voice.whyUrgent}&rdquo;
      </blockquote>
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="text-[9px] uppercase tracking-[0.2em] text-white/45">
          {voice.acute ? "Their top priority" : "Among their concerns"}
        </div>
        <div className="mt-1 text-[12px] text-white/75">{canonical}</div>
      </div>
    </article>
  );
}

