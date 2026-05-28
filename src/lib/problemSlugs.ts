import { PROBLEMS, type Problem } from "./types";

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
