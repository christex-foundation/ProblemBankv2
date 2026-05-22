export type Gender = "Female" | "Male" | "Other / Prefer not to say";

export type AgeBand = "18-25" | "26-35" | "36-50" | "Above 50" | "Unknown";

export const AGE_BANDS: AgeBand[] = ["18-25", "26-35", "36-50", "Above 50", "Unknown"];

export type Problem =
  | "Water or sanitation problems"
  | "Unemployment"
  | "Drug or substance abuse"
  | "Insecurity"
  | "Poor education"
  | "Poor healthcare"
  | "Poverty"
  | "Mental health challenges"
  | "Gender-based violence"
  | "Other";

export const PROBLEMS: Problem[] = [
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

export type Support =
  | "Skills training"
  | "Job opportunities"
  | "Business or financial support"
  | "Education support"
  | "Health services"
  | "Mental health support"
  | "Youth programs"
  | "Women and girls support"
  | "Information or awareness programs"
  | "Other";

export const SUPPORTS: Support[] = [
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

export type Channel =
  | "Community meetings"
  | "Phone / WhatsApp"
  | "Radio"
  | "Social media"
  | "In-person support centers"
  | "Other";

export const CHANNELS: Channel[] = [
  "Community meetings",
  "Phone / WhatsApp",
  "Radio",
  "Social media",
  "In-person support centers",
  "Other",
];

export type Group = "Youth" | "Women" | "Men" | "Children" | "Everyone";

export const GROUPS: Group[] = ["Youth", "Women", "Men", "Children", "Everyone"];

export interface SurveyResponse {
  id: string;
  enumeratorName: string;
  ageBand: AgeBand;
  gender: Gender | "";
  community: string;
  occupation: string;
  biggestProblems: Problem[];
  otherProblem?: string;
  problemMost: string;
  currentSolutions: string;
  whatIsMissing: string;
  supportNeeded: Support[];
  otherSupport?: string;
  whoNeedsSupportMost: Group[];
  topPriorityText: string;
  whyUrgent: string;
  preferredChannel: Channel[];
  otherChannel?: string;
  barriers: string;
  additionalComments?: string;
}
