import { PROBLEMS, type Problem } from "./types";

/**
 * Canonical short, uppercase label for each survey problem. Single source of
 * truth shared by every Matrix view so the same problem always reads the same
 * way (previously each view kept its own copy and they had drifted, e.g.
 * "WATER" vs "WATER & SANITATION"). Falls back to `problem.toUpperCase()` for
 * any key not listed.
 */
export const SHORT_PROBLEM: Record<string, string> = {
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

export function slugifyProblem(problem: string): string {
  return problem
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Generic slugifier — same shape, just named for non-Problem callers. */
export const slugify = slugifyProblem;

export function findProblemBySlug(slug: string): Problem | null {
  for (const p of PROBLEMS) {
    if (slugifyProblem(p) === slug) return p;
  }
  return null;
}

/** Find a community name from the dataset whose slug matches `slug`. */
export function findCommunityBySlug(
  slug: string,
  allCommunities: Iterable<string>,
): string | null {
  for (const c of allCommunities) {
    if (slugifyProblem(c) === slug) return c;
  }
  return null;
}
