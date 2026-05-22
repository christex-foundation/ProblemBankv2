#!/usr/bin/env node
/**
 * Parses src/data/responses.tsv → normalizes rows → src/data/responses.json
 * Then runs the same d3-force simulation the runtime used to do, and writes
 * the settled layout to src/data/universe-layout.json.
 *
 * Re-run: `npm run build:data` after editing the TSV.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";
import { geoMercator } from "d3-geo";
import bbox from "@turf/bbox";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point as turfPoint } from "@turf/helpers";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const TSV_PATH = resolve(ROOT, "src/data/responses.tsv");
const RESPONSES_OUT = resolve(ROOT, "src/data/responses.json");
const UNIVERSE_OUT = resolve(ROOT, "src/data/universe-layout.json");
const GEOJSON_PATH = resolve(ROOT, "src/data/sierra-leone-western-area.json");
const MAP_OUT = resolve(ROOT, "src/data/map-layout.json");

// ----- Community placements (kept in sync with src/lib/communities.ts) -----
// Positions are in SVG space. The map is decommissioned; clusters are laid out
// to fill the canvas rather than to honour geography.
const COMMUNITY_GEO = {
  Grafton: { cx: 280, cy: 320, radiusPx: 180 },
  "Fourah Bay College": { cx: 1120, cy: 320, radiusPx: 150 },
  Kroobay: { cx: 700, cy: 560, radiusPx: 140 },
  Aberdeen: { cx: 280, cy: 830, radiusPx: 130 },
  "Fourah Bay": { cx: 1120, cy: 830, radiusPx: 140 },
};
const SURVEY_COMMUNITIES = new Set(Object.keys(COMMUNITY_GEO));

const MAP_VIEW = { width: 1400, height: 1100 };
// Manual projection params — see src/lib/map.ts for rationale (geoBoundaries
// winding breaks fitExtent, so we hand-tune scale + center).
// Centered on the bbox of the five survey communities with breathing room.
const MAP_CENTER = [-13.180, 8.440];
const MAP_SCALE = 300000;

// Seedable RNG for deterministic sampling
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function randomPointInFeature(feature, rng) {
  const bb = bbox(feature);
  const [minX, minY, maxX, maxY] = bb;
  for (let i = 0; i < 300; i++) {
    const lng = minX + rng() * (maxX - minX);
    const lat = minY + rng() * (maxY - minY);
    if (booleanPointInPolygon(turfPoint([lng, lat]), feature)) {
      return [lng, lat];
    }
  }
  return [(minX + maxX) / 2, (minY + maxY) / 2];
}

function randomPointInCircle(lng, lat, radiusM, rng) {
  const r = radiusM * Math.sqrt(rng());
  const theta = rng() * 2 * Math.PI;
  const dLat = (r * Math.cos(theta)) / 111111;
  const dLng = (r * Math.sin(theta)) / (111111 * Math.cos((lat * Math.PI) / 180));
  return [lng + dLng, lat + dLat];
}

// ----- Whitelists (must match src/lib/types.ts) -----

const PROBLEMS = [
  "Water or sanitation problems",
  "Unemployment",
  "Drug or substance abuse",
  "Insecurity",
  "Poor education",
  "Poor healthcare",
  "Poverty",
  "Mental health challenges",
  "Gender-based violence",
  "Other",
];

const SUPPORTS = [
  "Skills training",
  "Job opportunities",
  "Business or financial support",
  "Education support",
  "Health services",
  "Mental health support",
  "Youth programs",
  "Women and girls support",
  "Information or awareness programs",
  "Other",
];

const CHANNELS = [
  "Community meetings",
  "Phone / WhatsApp",
  "Radio",
  "Social media",
  "In-person support centers",
  "Other",
];

const GROUPS = ["Youth", "Women", "Men", "Children", "Everyone"];

const AGE_BANDS = ["18-25", "26-35", "36-50", "Above 50"];

const COMMUNITY_NORMALIZE = {
  Graphtoon: "Grafton",
  Graphftoon: "Grafton",
  Graphton: "Grafton",
  Graphftoon: "Grafton",
  "Grafton community": "Grafton",
  "Grafton community low bait bureh villa": "Grafton",
  "Grafton community bai bureh": "Grafton",
  "Forut grafton": "Forut",
  "Forut grafton community": "Forut",
  "Forut Community": "Forut",
  "PVA grafton": "Grafton",
  "Polio community": "Polio",
  "War wounded community": "War wounded",
  "War wounded community (Grafton)": "War wounded",
  "War wounded community (Grafton community)": "War wounded",
  "War wounded community (Grafton )": "War wounded",
  "Bai Bureh Field": "Bai Bureh",
  "Joshua Bai Bureh Road": "Bai Bureh",
  "Krookbay": "Kroobay",
  "Krookbay community": "Kroobay",
  "Kroobay community": "Kroobay",
  "Krooybay": "Kroobay",
  "Krooybay Community": "Kroobay",
  "Kookbay community": "Kroobay",
  "Foubay community": "Fourah Bay",
  "Fouray Bay Community": "Fourah Bay",
  "Fourbah road community": "Fourah Bay",
  "Fourbah Community": "Fourah Bay",
  "Fourbah community": "Fourah Bay",
  "Fourah Bay community": "Fourah Bay",
  "Fourah Bay College": "Fourah Bay College",
  "Fourah Bay college": "Fourah Bay College",
  "Fourbah college": "Fourah Bay College",
  "Fourbah College": "Fourah Bay College",
  "Fourbah college community": "Fourah Bay College",
  "Fourah Bay college Community": "Fourah Bay College",
  "Fouray Bay college Community": "Fourah Bay College",
  "Fouray Bay College Community": "Fourah Bay College",
  "Fourah Bay University": "Fourah Bay College",
  "Fourth bay university": "Fourah Bay College",
  "Fourth Bay University": "Fourah Bay College",
  "Fourahbay University": "Fourah Bay College",
  "Fourah College": "Fourah Bay College",
  "Aberdeen Community": "Aberdeen",
  "Aberdeen community": "Aberdeen",
  "Aberdeen community (crab town)": "Aberdeen",
  "Aberdeen community crab town": "Aberdeen",
  "Aberdeeen": "Aberdeen",
  "Eastern urban": "Eastern Urban",
  "Nylender street": "Nylender Street",
  "Nylender Street": "Nylender Street",
  "Johnson Street": "Johnson Street",
  "Johnson lane and street": "Johnson Street",
  "Johnson lane/street": "Johnson Street",
  "Johnson street": "Johnson Street",
};

function normalizeCommunity(raw) {
  const s = (raw ?? "").trim();
  if (!s) return "Unknown";

  // 1. Case-insensitive lookup in the explicit map
  const lower = s.toLowerCase();
  for (const [key, val] of Object.entries(COMMUNITY_NORMALIZE)) {
    if (key.toLowerCase() === lower) return val;
  }

  // 2. Pattern matching for variants and typos. Order matters — college /
  //    university must be checked before plain Fourah Bay.
  if (/\bfbc\b/i.test(s)) return "Fourah Bay College";
  if (/(fou|four).*\b(college|univers)/i.test(s)) return "Fourah Bay College";
  if (/(college|univers).*\b(fou|four)/i.test(s)) return "Fourah Bay College";
  if (/(fou|four).*bay/i.test(s) || /fourahbay/i.test(s) || /fourbay/i.test(s)) {
    return "Fourah Bay";
  }
  if (/k(r|o)+(o)?b(a)?y/i.test(s) || /krook/i.test(s)) return "Kroobay";
  if (/aberd/i.test(s)) return "Aberdeen";
  if (/graf(t)?on|graph[ft]+(o)+n/i.test(s)) return "Grafton";
  if (/^forut/i.test(s)) return "Forut";
  if (/polio/i.test(s)) return "Polio";
  if (/war\s*wound/i.test(s)) return "War wounded";
  if (/bai\s*bureh|joshua\s*bai/i.test(s)) return "Bai Bureh";
  if (/johnson/i.test(s)) return "Johnson Street";
  if (/nylender/i.test(s)) return "Nylender Street";
  if (/eastern\s*urban/i.test(s)) return "Eastern Urban";

  return s;
}

function normalizeAgeBand(raw) {
  const s = (raw ?? "").trim();
  if (!s) return "Unknown";
  if (AGE_BANDS.includes(s)) return s;
  return "Unknown";
}

function normalizeGender(raw) {
  const s = (raw ?? "").trim();
  if (!s) return "";
  if (s === "Female" || s === "Male") return s;
  return "Other / Prefer not to say";
}

function splitMulti(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function whitelist(values, allowed) {
  const out = [];
  const seen = new Set();
  for (const v of values) {
    const found = allowed.find(
      (a) => a.toLowerCase() === v.toLowerCase(),
    );
    const final = found ?? "Other";
    if (!seen.has(final)) {
      seen.add(final);
      out.push(final);
    }
  }
  return out;
}

// ----- Row parser (handles multi-line cells) -----
function parseTsv(text) {
  // Strip BOM and carriage returns
  const clean = text.replace(/^﻿/, "").replace(/\r/g, "");
  const lines = clean.split("\n");
  const rows = [];
  let buffer = "";
  for (const line of lines) {
    buffer = buffer.length === 0 ? line : `${buffer}\n${line}`;
    const tabCount = buffer.split("\t").length - 1;
    if (tabCount >= 19) {
      // Row complete (20 fields = 19 tabs)
      const fields = buffer.split("\t");
      // If we got more than 20 (extra tabs in cell), join the tail into the last field
      const head = fields.slice(0, 19);
      const tail = fields.slice(19).join("\t");
      rows.push([...head, tail]);
      buffer = "";
    }
  }
  // Drop trailing whitespace-only buffer; warn if there's a partial leftover
  if (buffer.trim().length > 0) {
    console.warn(
      `[build-data] WARNING: ${buffer.split("\t").length - 1} extra tabs in trailing buffer; last row may be malformed:\n  ${buffer.slice(0, 200)}`,
    );
  }
  return rows;
}

// ----- Main -----

const tsv = readFileSync(TSV_PATH, "utf8");
const allRows = parseTsv(tsv);
if (allRows.length < 2) {
  console.error("[build-data] No rows parsed; aborting.");
  process.exit(1);
}
const [header, ...dataRows] = allRows;

console.log(`[build-data] header: ${header.length} fields`);
console.log(`[build-data] data rows: ${dataRows.length}`);

const responses = dataRows.map((row, i) => {
  const [
    respondentAge,
    enumeratorName,
    _age,
    gender,
    community,
    occupation,
    biggestProblems,
    otherProblem,
    problemMost,
    currentSolutions,
    whatIsMissing,
    supportNeeded,
    otherSupport,
    whoNeedsSupportMost,
    topPriority,
    whyUrgent,
    preferredChannel,
    otherChannel,
    barriers,
    additionalComments,
  ] = row;

  return {
    id: `R-${String(i + 1).padStart(4, "0")}`,
    enumeratorName: (enumeratorName ?? "").trim(),
    ageBand: normalizeAgeBand(respondentAge),
    gender: normalizeGender(gender),
    community: normalizeCommunity(community),
    occupation: (occupation ?? "").trim(),
    biggestProblems: whitelist(splitMulti(biggestProblems), PROBLEMS),
    otherProblem: (otherProblem ?? "").trim() || undefined,
    problemMost: (problemMost ?? "").trim(),
    currentSolutions: (currentSolutions ?? "").trim(),
    whatIsMissing: (whatIsMissing ?? "").trim(),
    supportNeeded: whitelist(splitMulti(supportNeeded), SUPPORTS),
    otherSupport: (otherSupport ?? "").trim() || undefined,
    whoNeedsSupportMost: whitelist(splitMulti(whoNeedsSupportMost), GROUPS),
    topPriorityText: (topPriority ?? "").trim(),
    whyUrgent: (whyUrgent ?? "").trim(),
    preferredChannel: whitelist(splitMulti(preferredChannel), CHANNELS),
    otherChannel: (otherChannel ?? "").trim() || undefined,
    barriers: (barriers ?? "").trim(),
    additionalComments: (additionalComments ?? "").trim() || undefined,
  };
});

writeFileSync(RESPONSES_OUT, JSON.stringify(responses, null, 2));
console.log(`[build-data] wrote ${responses.length} responses → ${RESPONSES_OUT}`);

// ----- Build universe layout -----

const CATEGORY_COLOR = {
  Economy: "#c8442a",
  Infrastructure: "#2f5e3e",
  "Social services": "#3b5b9a",
  Safety: "#8a6d3b",
};

const PROBLEM_CATEGORY = {
  Unemployment: "Economy",
  Poverty: "Economy",
  "Water or sanitation problems": "Infrastructure",
  "Poor education": "Social services",
  "Poor healthcare": "Social services",
  "Mental health challenges": "Social services",
  "Drug or substance abuse": "Safety",
  Insecurity: "Safety",
  "Gender-based violence": "Safety",
  Other: "Social services",
};

const GREY = "#1c1b18";

// Keywords used to map a respondent's free-text top priority (topPriorityText
// or problemMost) onto one of the 10 canonical Problems. Order matters within
// each list — more specific phrases first.
// Keywords used to map a respondent's free-text top priority onto one of the
// 10 canonical Problems. Be wary of short ambiguous tokens — e.g. bare " poor "
// false-matches "poor toilet facility" (which is sanitation, not poverty).
const PROBLEM_KEYWORDS = {
  "Drug or substance abuse": [
    "drug", "substance abuse", "kush", "addict", "cocaine", "marijuana", "smok",
  ],
  "Water or sanitation problems": [
    "water", "sanitat", "toilet", "tap ", "pipe", "drain", "sewage", "latrine",
  ],
  "Unemployment": [
    "unemploy", "jobless", "no job", "lack of work", "no work", "work for",
    "skills training", "earning", "no income", "idle youth", "youth idle", "job",
  ],
  "Poor education": ["educat", "school", "literac", "learning"],
  "Poor healthcare": [
    "healthcare", "health care", "hospital", "clinic", "medical", "doctor", "nurse",
  ],
  "Mental health challenges": [
    "mental health", "depress", "psycholog", "trauma", "suicid",
  ],
  "Gender-based violence": [
    "gender-based", "gender based", "gbv", "domestic violence", "rape",
    "violence against women", "abuse women", "prostitut", "sex for money",
    "sex work", "teen pregnan", "teenage pregnan", "early pregnan",
    "young woman", "young girl", "girl child", "girls suffer",
  ],
  "Insecurity": [
    "insecur", "crime", "robber", "theft", "criminal", "armed", "thief", "thieve", "stealing",
  ],
  "Poverty": [
    "poverty", "poor people", "poor famil", "hardship", "hunger", "no food",
    "destitut", "no money", "broke",
  ],
  Other: [],
};

/**
 * Find a respondent's text snippet that's on-topic for `problem`. Scans all
 * three free-text fields (whyUrgent → topPriorityText → problemMost) and
 * returns the first one whose lowercase form contains a keyword for that
 * problem. Returns null if nothing in their answers touches the problem.
 *
 * Used to surface voices whose words are genuinely about the problem, not
 * about whichever box they happened to check.
 */
function findRelevantQuote(r, problem) {
  const kws = PROBLEM_KEYWORDS[problem] || [];
  if (kws.length === 0) return null;
  const candidates = [
    { text: r.whyUrgent, source: "whyUrgent" },
    { text: r.topPriorityText, source: "topPriority" },
    { text: r.problemMost, source: "problemMost" },
  ];
  for (const c of candidates) {
    const text = (c.text || "").trim();
    if (!text) continue;
    const lower = text.toLowerCase();
    for (const kw of kws) {
      if (lower.includes(kw)) return { text, source: c.source };
    }
  }
  return null;
}

/**
 * Determine a respondent's *actual* top-priority Problem.
 *
 * The raw survey has two free-text fields plus a multi-select. Order within
 * `biggestProblems` is arbitrary (checkbox click order, not priority). So we
 * match the free text against keywords. Preference order:
 *   1. `topPriorityText` is the more elaborated answer — try it first.
 *   2. Within that, prefer a match that's ALSO in `biggestProblems` so the
 *      text clarifies which checked item is the #1.
 *   3. Fall through to `problemMost` (often a shorter direct answer).
 *   4. Final fallback to `biggestProblems[0]` when text is empty or doesn't
 *      match any keyword.
 */
function inferTopProblem(r) {
  const sources = [
    (r.topPriorityText || "").toLowerCase(),
    (r.problemMost || "").toLowerCase(),
  ];
  const anyText = sources.some((s) => s.trim().length > 0);
  for (const text of sources) {
    if (!text.trim()) continue;
    // Pass 1: a checked problem whose keyword appears in this text.
    for (const checked of r.biggestProblems) {
      const kws = PROBLEM_KEYWORDS[checked] || [];
      for (const kw of kws) {
        if (text.includes(kw)) return checked;
      }
    }
    // Pass 2: any keyword match anywhere — their words matter more than the
    // boxes they checked.
    for (const [problem, kws] of Object.entries(PROBLEM_KEYWORDS)) {
      for (const kw of kws) {
        if (text.includes(kw)) return problem;
      }
    }
  }
  // Conservative fallback: ONLY when there's no free-text answer at all do
  // we trust biggestProblems[0]. If the respondent wrote something and it
  // didn't match any keyword (e.g. "Drainage System", "Slow sale", "Job"),
  // we'd rather mark them as having no clearly-identified top priority than
  // pin them to whatever checkbox happened to be first.
  if (!anyText) return r.biggestProblems[0] ?? null;
  return null;
}

function classifyAcute(rows) {
  const total = rows.length;
  const named = new Map();
  const priority = new Map();
  for (const r of rows) {
    for (const p of r.biggestProblems) named.set(p, (named.get(p) ?? 0) + 1);
    const first = inferTopProblem(r);
    if (first) priority.set(first, (priority.get(first) ?? 0) + 1);
  }
  const acute = new Set();
  for (const [p, n] of named) {
    const pri = priority.get(p) ?? 0;
    const share = (n / total) * 100;
    const priShare = (pri / total) * 100;
    if (priShare >= 14 || share >= 35) acute.add(p);
  }
  return acute;
}

function buildUniverse(allRows) {
  // Galaxy view restricted to the five survey communities.
  const rows = allRows.filter((r) => SURVEY_COMMUNITIES.has(r.community));
  // Bigger viewBox than the natural settle-radius so the cloud floats inside
  // (no edge-clamping → no rectangle).
  const width = 1800;
  const height = 1700;
  const acute = classifyAcute(rows);

  const respondentNodes = rows.map((r) => {
    const firstProblem = inferTopProblem(r);
    const topCat = firstProblem ? PROBLEM_CATEGORY[firstProblem] : "Social services";
    const isAcute = firstProblem ? acute.has(firstProblem) : false;
    return {
      id: `R:${r.id}`,
      kind: "respondent",
      respondentId: r.id,
      community: r.community,
      ageBand: r.ageBand,
      gender: r.gender || "",
      topPriorityText: r.topPriorityText,
      topSupport: r.supportNeeded[0] ?? "",
      whyUrgent: r.whyUrgent,
      category: topCat,
      isAcute,
      color: isAcute ? CATEGORY_COLOR[topCat] : GREY,
      r: isAcute ? 8.5 : 6.5,
      x: width / 2 + (Math.random() - 0.5) * 600,
      y: height / 2 + (Math.random() - 0.5) * 400,
    };
  });

  const mentionNodes = [];
  const mentionEdges = [];
  for (const r of rows) {
    const firstProblem = inferTopProblem(r);
    for (const p of r.biggestProblems) {
      const cat = PROBLEM_CATEGORY[p];
      // Per-respondent acute: this mention is the respondent's #1 priority.
      // (We deliberately don't gate on the global `acute` set here — that
      // filter is for problem-level styling, not per-mention truth.)
      const isAcute = firstProblem === p;
      // Find an on-topic quote for this specific (respondent, problem) pair.
      // Scans whyUrgent → topPriorityText → problemMost; null if none touches
      // the problem.
      const relevant = findRelevantQuote(r, p);
      const id = `M:${r.id}:${p}`;
      mentionNodes.push({
        id,
        kind: "mention",
        respondentId: r.id,
        problem: p,
        category: cat,
        isAcute,
        isOnTopic: relevant !== null,
        voiceQuote: relevant?.text ?? "",
        voiceSource: relevant?.source ?? "",
        color: isAcute ? CATEGORY_COLOR[cat] : GREY,
        community: r.community,
        ageBand: r.ageBand,
        gender: r.gender || "",
        occupation: r.occupation || "",
        topPriorityText: r.topPriorityText,
        topSupport: r.supportNeeded[0] ?? "",
        whyUrgent: r.whyUrgent,
        r: isAcute ? 4.0 : 3.2,
        x: width / 2 + (Math.random() - 0.5) * 700,
        y: height / 2 + (Math.random() - 0.5) * 500,
      });
      mentionEdges.push({
        source: `R:${r.id}`,
        target: id,
        weight: 1.5,
        isAcute,
      });
    }
  }

  const byProblem = new Map();
  for (const n of mentionNodes) {
    if (!n.problem) continue;
    if (!byProblem.has(n.problem)) byProblem.set(n.problem, []);
    byProblem.get(n.problem).push(n);
  }
  const chainEdges = [];
  for (const [problem, list] of byProblem) {
    const isAcute = acute.has(problem);
    for (let i = 0; i < list.length - 1; i++) {
      chainEdges.push({
        source: list[i].id,
        target: list[i + 1].id,
        weight: 0.9,
        isAcute,
      });
    }
    for (let i = 0; i < Math.floor(list.length / 6); i++) {
      const a = list[Math.floor(Math.random() * list.length)];
      const b = list[Math.floor(Math.random() * list.length)];
      if (a.id !== b.id) {
        chainEdges.push({
          source: a.id,
          target: b.id,
          weight: 0.4,
          isAcute,
        });
      }
    }
  }

  const respByProblem = new Map();
  for (const r of rows) {
    for (const p of r.biggestProblems) {
      if (!respByProblem.has(p)) respByProblem.set(p, []);
      respByProblem.get(p).push(r.id);
    }
  }
  const coEdges = [];
  const seen = new Set();
  for (const r of rows) {
    const candidates = new Map();
    for (const p of r.biggestProblems) {
      const list = respByProblem.get(p) ?? [];
      for (const otherId of list) {
        if (otherId === r.id) continue;
        candidates.set(otherId, (candidates.get(otherId) ?? 0) + 1);
      }
    }
    const strong = Array.from(candidates.entries()).filter(([, n]) => n >= 2);
    strong.sort((a, b) => b[1] - a[1]);
    for (const [otherId] of strong.slice(0, 2)) {
      const key = r.id < otherId ? `${r.id}|${otherId}` : `${otherId}|${r.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      coEdges.push({
        source: `R:${r.id}`,
        target: `R:${otherId}`,
        weight: 0.3,
        isAcute: false,
      });
    }
  }

  const nodes = [...respondentNodes, ...mentionNodes];
  const edges = [...mentionEdges, ...chainEdges, ...coEdges];

  const sim = forceSimulation(nodes)
    .force(
      "link",
      forceLink(edges)
        .id((d) => d.id)
        .distance((d) => (d.weight > 1 ? 26 : 36))
        .strength((d) => (d.weight > 1 ? 0.7 : 0.25)),
    )
    .force(
      "charge",
      forceManyBody().strength((d) => (d.kind === "respondent" ? -38 : -12)),
    )
    .force("center", forceCenter(width / 2, height / 2).strength(0.08))
    .force("x", forceX(width / 2).strength(0.04))
    .force("y", forceY(height / 2).strength(0.04))
    .force(
      "collide",
      forceCollide()
        .radius((d) => d.r + 1.5)
        .strength(0.92),
    )
    .stop();

  const ticks = 480;
  for (let i = 0; i < ticks; i++) sim.tick();

  // No edge clamp — the cloud is meant to settle as a free-floating shape.
  // If a dot drifts outside the viewBox it'll be clipped by the SVG, but the
  // canvas is sized large enough that natural settle stays well inside.

  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      kind: n.kind,
      respondentId: n.respondentId,
      problem: n.problem,
      category: n.category,
      color: n.color,
      isAcute: n.isAcute,
      isOnTopic: n.isOnTopic ?? false,
      voiceQuote: n.voiceQuote ?? "",
      voiceSource: n.voiceSource ?? "",
      community: n.community,
      ageBand: n.ageBand,
      gender: n.gender,
      occupation: n.occupation ?? "",
      topPriorityText: n.topPriorityText,
      topSupport: n.topSupport,
      whyUrgent: n.whyUrgent,
      r: n.r,
      x: n.x,
      y: n.y,
    })),
    edges: edges.map((e) => ({
      source: typeof e.source === "string" ? e.source : e.source.id,
      target: typeof e.target === "string" ? e.target : e.target.id,
      weight: e.weight,
      isAcute: e.isAcute,
    })),
    width,
    height,
    acuteProblems: Array.from(acute),
  };
}

const universe = buildUniverse(responses);
writeFileSync(UNIVERSE_OUT, JSON.stringify(universe));
console.log(
  `[build-data] simulated ${universe.nodes.length} nodes / ${universe.edges.length} edges → ${UNIVERSE_OUT}`,
);
console.log(`[build-data] acute problems: ${universe.acuteProblems.join(", ")}`);

// ----- Map layout pass -----

function buildMapUniverse(allRows) {
  // Map view shows only the five survey communities.
  const rows = allRows.filter((r) => SURVEY_COMMUNITIES.has(r.community));
  const dropped = allRows.length - rows.length;
  if (dropped > 0) {
    console.log(
      `[build-data] map: filtered to ${rows.length} respondents in survey communities (${dropped} from other communities dropped)`,
    );
  }

  const acute = classifyAcute(rows);
  const rng = makeRng(7);

  const respondentNodes = [];

  for (const r of rows) {
    const placement = COMMUNITY_GEO[r.community];
    if (!placement) continue; // shouldn't happen — filtered above

    // Sample uniformly inside a circle in SVG coords.
    const u = Math.sqrt(rng());
    const theta = rng() * 2 * Math.PI;
    const px = placement.cx + Math.cos(theta) * placement.radiusPx * u;
    const py = placement.cy + Math.sin(theta) * placement.radiusPx * u;

    const firstProblem = inferTopProblem(r);
    const topCat = firstProblem ? PROBLEM_CATEGORY[firstProblem] : "Social services";
    const isAcute = firstProblem ? acute.has(firstProblem) : false;

    respondentNodes.push({
      id: `R:${r.id}`,
      kind: "respondent",
      respondentId: r.id,
      community: r.community,
      ageBand: r.ageBand,
      gender: r.gender || "",
      topPriorityText: r.topPriorityText,
      topSupport: r.supportNeeded[0] ?? "",
      whyUrgent: r.whyUrgent,
      category: topCat,
      isAcute,
      color: isAcute ? CATEGORY_COLOR[topCat] : GREY,
      r: isAcute ? 7.0 : 5.5,
      x: px,
      y: py,
    });
  }

  // Mention nodes are placed near their respondent (small jittered offset) — they
  // don't have a geography of their own.
  const mentionNodes = [];
  const mentionEdges = [];
  const respondentLookup = new Map(respondentNodes.map((n) => [n.respondentId, n]));
  for (const r of rows) {
    const respNode = respondentLookup.get(r.id);
    if (!respNode) continue;
    const firstProblem = inferTopProblem(r);
    for (const p of r.biggestProblems) {
      const cat = PROBLEM_CATEGORY[p];
      // Per-respondent acute: this mention is the respondent's #1 priority.
      // (We deliberately don't gate on the global `acute` set here — that
      // filter is for problem-level styling, not per-mention truth.)
      const isAcute = firstProblem === p;
      const relevant = findRelevantQuote(r, p);
      const id = `M:${r.id}:${p}`;
      const angle = rng() * Math.PI * 2;
      const dist = 9 + rng() * 7;
      mentionNodes.push({
        id,
        kind: "mention",
        respondentId: r.id,
        problem: p,
        category: cat,
        isAcute,
        isOnTopic: relevant !== null,
        voiceQuote: relevant?.text ?? "",
        voiceSource: relevant?.source ?? "",
        color: isAcute ? CATEGORY_COLOR[cat] : GREY,
        community: r.community,
        ageBand: r.ageBand,
        gender: r.gender || "",
        occupation: r.occupation || "",
        topPriorityText: r.topPriorityText,
        topSupport: r.supportNeeded[0] ?? "",
        whyUrgent: r.whyUrgent,
        r: isAcute ? 3.4 : 2.6,
        x: respNode.x + Math.cos(angle) * dist,
        y: respNode.y + Math.sin(angle) * dist,
      });
      mentionEdges.push({
        source: `R:${r.id}`,
        target: id,
        weight: 1.5,
        isAcute,
      });
    }
  }

  // co-mention edges between respondents who share 2+ named problems (sampled)
  const respByProblem = new Map();
  for (const r of rows) {
    for (const p of r.biggestProblems) {
      if (!respByProblem.has(p)) respByProblem.set(p, []);
      respByProblem.get(p).push(r.id);
    }
  }
  const coEdges = [];
  const seen = new Set();
  for (const r of rows) {
    const candidates = new Map();
    for (const p of r.biggestProblems) {
      const list = respByProblem.get(p) ?? [];
      for (const otherId of list) {
        if (otherId === r.id) continue;
        candidates.set(otherId, (candidates.get(otherId) ?? 0) + 1);
      }
    }
    const strong = Array.from(candidates.entries()).filter(([, n]) => n >= 2);
    strong.sort((a, b) => b[1] - a[1]);
    for (const [otherId] of strong.slice(0, 1)) {
      const key = r.id < otherId ? `${r.id}|${otherId}` : `${otherId}|${r.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      coEdges.push({ source: `R:${r.id}`, target: `R:${otherId}`, weight: 0.3, isAcute: false });
    }
  }

  console.log(
    `[build-data] map: placed ${rows.length} respondents into 5 community clusters`,
  );

  return {
    nodes: [...respondentNodes, ...mentionNodes],
    edges: [...mentionEdges, ...coEdges],
    width: MAP_VIEW.width,
    height: MAP_VIEW.height,
    acuteProblems: Array.from(acute),
  };
}

const mapUniverse = buildMapUniverse(responses);
writeFileSync(MAP_OUT, JSON.stringify(mapUniverse));
console.log(
  `[build-data] map: ${mapUniverse.nodes.length} nodes / ${mapUniverse.edges.length} edges → ${MAP_OUT}`,
);
