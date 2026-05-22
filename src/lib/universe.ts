import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from "d3-force";
import type { AgeBand, Problem, SurveyResponse } from "./types";
import { CATEGORY_COLOR, PROBLEM_CATEGORY } from "./categories";

export interface UniverseNode {
  id: string;
  kind: "respondent" | "mention";
  respondentId: string;
  problem?: Problem;
  category?: string;
  color: string;
  isAcute: boolean;
  community: string;
  ageBand: AgeBand;
  gender: string;
  occupation?: string;
  topPriorityText: string;
  topSupport: string;
  whyUrgent: string;
  /** True when this mention is the respondent's #1 named priority. */
  /** True when ANY of the respondent's free-text fields contains keywords for
   * this problem (broader than `isAcute`). Used to filter the voices section
   * so off-topic respondents don't appear on a problem detail page. */
  isOnTopic?: boolean;
  /** The on-topic text snippet for this (respondent, problem) pair, if any.
   * Picked from whyUrgent / topPriorityText / problemMost — whichever
   * actually contains a problem keyword. */
  voiceQuote?: string;
  /** Which field voiceQuote came from. */
  voiceSource?: string;
  r: number;
  x: number;
  y: number;
}

export interface UniverseEdge {
  source: string;
  target: string;
  weight: number;
  isAcute: boolean;
}

export interface Universe {
  nodes: UniverseNode[];
  edges: UniverseEdge[];
  width: number;
  height: number;
  acuteProblems: Problem[];
}

interface SimNode extends UniverseNode {
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimEdge {
  source: string | SimNode;
  target: string | SimNode;
  weight: number;
  isAcute: boolean;
}

const GREY = "#1c1b18";

function classifyAcute(rows: SurveyResponse[]): Set<Problem> {
  const total = rows.length;
  const named = new Map<Problem, number>();
  // Approximate "priority" by counting respondents whose first listed problem matches.
  // (topPriorityText is now free-form and unreliable for direct matching.)
  const priority = new Map<Problem, number>();
  for (const r of rows) {
    for (const p of r.biggestProblems) named.set(p, (named.get(p) ?? 0) + 1);
    const first = r.biggestProblems[0];
    if (first) priority.set(first, (priority.get(first) ?? 0) + 1);
  }
  const acute = new Set<Problem>();
  for (const [p, n] of named) {
    const pri = priority.get(p) ?? 0;
    const share = (n / total) * 100;
    const priShare = (pri / total) * 100;
    if (priShare >= 14 || share >= 35) acute.add(p);
  }
  return acute;
}

export function buildUniverse(rows: SurveyResponse[]): Universe {
  const width = 1400;
  const height = 900;

  const acute = classifyAcute(rows);

  const respondentNodes: SimNode[] = rows.map((r) => {
    const firstProblem = r.biggestProblems[0];
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

  const mentionNodes: SimNode[] = [];
  const mentionEdges: SimEdge[] = [];
  for (const r of rows) {
    const firstProblem = r.biggestProblems[0];
    for (const p of r.biggestProblems) {
      const cat = PROBLEM_CATEGORY[p];
      const isAcute = acute.has(p) && firstProblem === p;
      const id = `M:${r.id}:${p}`;
      mentionNodes.push({
        id,
        kind: "mention",
        respondentId: r.id,
        problem: p,
        category: cat,
        isAcute,
        color: isAcute ? CATEGORY_COLOR[cat] : GREY,
        community: r.community,
        ageBand: r.ageBand,
        gender: r.gender || "",
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

  // chain mentions of the same problem so each cluster forms an arm
  const byProblem = new Map<Problem, SimNode[]>();
  for (const n of mentionNodes) {
    if (!n.problem) continue;
    if (!byProblem.has(n.problem)) byProblem.set(n.problem, []);
    byProblem.get(n.problem)!.push(n);
  }
  const chainEdges: SimEdge[] = [];
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
    // a couple of cross-stitches per cluster to densify
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

  // co-mention edges between respondents who share 2+ named problems (sampled)
  const respByProblem = new Map<Problem, string[]>();
  for (const r of rows) {
    for (const p of r.biggestProblems) {
      if (!respByProblem.has(p)) respByProblem.set(p, []);
      respByProblem.get(p)!.push(r.id);
    }
  }
  const coEdges: SimEdge[] = [];
  const seen = new Set<string>();
  for (const r of rows) {
    const candidates = new Map<string, number>();
    for (const p of r.biggestProblems) {
      const list = respByProblem.get(p) ?? [];
      for (const otherId of list) {
        if (otherId === r.id) continue;
        candidates.set(otherId, (candidates.get(otherId) ?? 0) + 1);
      }
    }
    const strong = Array.from(candidates.entries()).filter(([, n]) => n >= 2);
    // sample up to 2 strong ties per respondent to keep edge count moderate
    strong.sort((a, b) => b[1] - a[1]);
    for (const [otherId] of strong.slice(0, 2)) {
      const key =
        r.id < otherId ? `${r.id}|${otherId}` : `${otherId}|${r.id}`;
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

  const nodes: SimNode[] = [...respondentNodes, ...mentionNodes];
  const edges: SimEdge[] = [...mentionEdges, ...chainEdges, ...coEdges];

  const sim = forceSimulation<SimNode>(nodes)
    .force(
      "link",
      forceLink<SimNode, SimEdge>(edges)
        .id((d) => d.id)
        .distance((d) => (d.weight > 1 ? 26 : 36))
        .strength((d) => (d.weight > 1 ? 0.7 : 0.25)),
    )
    .force(
      "charge",
      forceManyBody<SimNode>().strength((d) =>
        d.kind === "respondent" ? -55 : -18,
      ),
    )
    .force("center", forceCenter(width / 2, height / 2).strength(0.04))
    .force(
      "collide",
      forceCollide<SimNode>()
        .radius((d) => d.r + 1.5)
        .strength(0.92),
    )
    .stop();

  const ticks = 480;
  for (let i = 0; i < ticks; i++) sim.tick();

  // pad and clamp inside view
  const pad = 18;
  for (const n of nodes) {
    n.x = Math.min(width - pad, Math.max(pad, n.x));
    n.y = Math.min(height - pad, Math.max(pad, n.y));
  }

  const flatNodes: UniverseNode[] = nodes.map((n) => ({
    id: n.id,
    kind: n.kind,
    respondentId: n.respondentId,
    problem: n.problem,
    category: n.category,
    color: n.color,
    isAcute: n.isAcute,
    community: n.community,
    ageBand: n.ageBand,
    gender: n.gender,
    topPriorityText: n.topPriorityText,
    topSupport: n.topSupport,
    whyUrgent: n.whyUrgent,
    r: n.r,
    x: n.x,
    y: n.y,
  }));

  const flatEdges: UniverseEdge[] = edges.map((e) => ({
    source: typeof e.source === "string" ? e.source : e.source.id,
    target: typeof e.target === "string" ? e.target : e.target.id,
    weight: e.weight,
    isAcute: e.isAcute,
  }));

  return {
    nodes: flatNodes,
    edges: flatEdges,
    width,
    height,
    acuteProblems: Array.from(acute),
  };
}
