import { accentHex, categoryHex } from "@/design/tokens";
import type { Problem } from "./types";

export type Category =
  | "Economy"
  | "Infrastructure"
  | "Social services"
  | "Safety";

export const CATEGORY_COLOR: Record<Category, string> = {
  Economy: categoryHex.economy,
  Infrastructure: categoryHex.infrastructure,
  "Social services": categoryHex.social,
  Safety: categoryHex.safety,
};

export const PROBLEM_CATEGORY: Record<Problem, Category> = {
  "Unemployment": "Economy",
  "Poverty": "Economy",
  "Water or sanitation problems": "Infrastructure",
  "Poor education": "Social services",
  "Poor healthcare": "Social services",
  "Mental health challenges": "Social services",
  "Drug or substance abuse": "Safety",
  "Insecurity": "Safety",
  "Gender-based violence": "Safety",
  "Other": "Social services",
};

export const CATEGORIES: Category[] = [
  "Economy",
  "Infrastructure",
  "Social services",
  "Safety",
];

// One signature color per problem (in the survey enum). Used by the landing
// page so each scrolly scene's dots paint in their problem's own hue.
export const PROBLEM_COLOR: Record<Problem, string> = {
  "Water or sanitation problems": "#0c4a6e", // very dark cyan (water)
  Unemployment: accentHex, // terracotta (project accent)
  "Poor education": "#d4a017", // mustard / gold
  "Poor healthcare": "#b73d5b", // rose
  Poverty: "#6b4423", // umber
  "Drug or substance abuse": "#6b3782", // purple
  Insecurity: "#8b2a2a", // wine
  "Mental health challenges": "#2f7a72", // teal
  "Gender-based violence": "#3d5a4d", // forest
  Other: "#6e6a62", // muted grey
};
