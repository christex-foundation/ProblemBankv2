// Stable string codes for the API error envelope. Imported by route handlers
// (server) and by client code that needs to branch on a specific failure mode.
//
// When auth lands, the `unauthorized` and `forbidden` codes pair up with the
// `auth()` session check. Until then, endpoints accept a dev `userId` and the
// gates are TODO(auth) markers — see docs/endpoints/index.md.

export const API_ERROR_CODES = {
  // Auth (currently TODO(auth) — kept here so the contract is stable)
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',

  // Generic
  not_found: 'not_found',
  internal_error: 'internal_error',

  // Validation
  validation_failed: 'validation_failed',
  turnstile_failed: 'turnstile_failed',

  // Voting (deferred — codes reserved for the eventual votes slice)
  vote_quota_exceeded: 'vote_quota_exceeded',
  unvote_window_closed: 'unvote_window_closed',

  // Domain-specific
  already_registered: 'already_registered',
  comment_closed: 'comment_closed',
  not_admin: 'not_admin',
  not_owner: 'not_owner',
  duplicate_slug: 'duplicate_slug',
  invalid_github_url: 'invalid_github_url',
  upload_unconfigured: 'upload_unconfigured',
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];
