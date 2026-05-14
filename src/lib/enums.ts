// Problem Bank constants and enums.
// Mirrors the Technical Design and lives at the application layer so we can
// label, validate, and compute against the same source of truth.

export const SECTORS = [
  'Health',
  'Education',
  'Agriculture',
  'Finance',
  'Logistics',
  'Energy',
  'Infrastructure',
  'Other',
] as const;
export type Sector = (typeof SECTORS)[number];

// Categories on the community feed share the sector taxonomy for now.
export const CATEGORIES = SECTORS;
export type Category = (typeof CATEGORIES)[number];

export const URGENCY_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
} as const;
export type UrgencyKey = keyof typeof URGENCY_LABELS;

export const STATUS_LABELS = {
  submitted: 'Submitted',
  gaining_traction: 'Gaining Traction', // displayed only — never stored
  under_review: 'Under Review',
  research_in_progress: 'Research in Progress',
  not_viable: 'Not Viable',
  live: 'Live',
} as const;
export type DisplayStatus = keyof typeof STATUS_LABELS;

export const DOC_TYPES = [
  { key: 'concept_note', label: 'Concept Note' },
  { key: 'prd', label: 'PRD' },
  { key: 'technical_design', label: 'Technical Design' },
  { key: 'user_flows', label: 'User Flows and Wireframes' },
  { key: 'roadmap', label: 'Roadmap' },
  { key: 'pitch_deck', label: 'Pitch Deck' },
] as const;
export type DocTypeKey = (typeof DOC_TYPES)[number]['key'];

// Voting rules — see Tech Design §6.2
export const MAX_VOTES_PER_WEEK = 3;
export const UNVOTE_WINDOW_MS = 5 * 60 * 1000;

// Gaining Traction thresholds — see Tech Design §6.3
export const GAINING_TRACTION_WINDOW_DAYS = 14;
export const GAINING_TRACTION_MIN_DISTINCT_DAYS = 3;

// Submission body limits
export const MAX_TITLE_LEN = 80;
export const MAX_BIO_LEN = 160;
export const MAX_COMMENT_LEN = 2000;
export const MAX_PASSWORD_LEN = 200;
export const MIN_PASSWORD_LEN = 8;
