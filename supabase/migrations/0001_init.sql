-- Problem Bank initial schema.
-- Mirrors the Technical Design (formerly prisma/schema.prisma).
-- Tables and columns are quoted (Prisma-style PascalCase / camelCase) so
-- existing TypeScript code keeps working unchanged.

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

CREATE TYPE "SubmissionStatus" AS ENUM (
  'submitted',
  'under_review',
  'research_in_progress',
  'not_viable',
  'live'
);

CREATE TYPE "Urgency" AS ENUM ('critical', 'high', 'medium', 'low');

CREATE TYPE "DocType" AS ENUM (
  'concept_note',
  'prd',
  'technical_design',
  'user_flows',
  'roadmap',
  'pitch_deck'
);

CREATE TYPE "NotificationType" AS ENUM ('status_change', 'new_comment');


-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE "User" (
  "id"           TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "email"        TEXT UNIQUE,
  "phone"        TEXT UNIQUE,
  "passwordHash" TEXT,
  "name"         TEXT,
  "bio"          TEXT,
  "githubUrl"    TEXT,
  "contactEmail" TEXT,
  "websiteUrl"   TEXT,
  "role"         "UserRole" NOT NULL DEFAULT 'user',
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Keep updatedAt fresh via trigger.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_updated_at
  BEFORE UPDATE ON "User"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- LIBRARY ENTRIES
-- ============================================================

CREATE TABLE "LibraryEntry" (
  "id"               TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "slug"             TEXT NOT NULL UNIQUE,
  "title"            TEXT NOT NULL,
  "problemStatement" TEXT NOT NULL,
  "sector"           TEXT NOT NULL,
  "urgency"          "Urgency" NOT NULL,
  "kitUrl"           TEXT,
  "demoUrl"          TEXT,
  "infographicUrl"   TEXT,
  "publishedAt"      TIMESTAMPTZ,
  "createdBy"        TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "badgeFetchCount"  INTEGER NOT NULL DEFAULT 0,
  "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX library_entry_published_idx ON "LibraryEntry" ("publishedAt");
CREATE INDEX library_entry_sector_idx    ON "LibraryEntry" ("sector");

CREATE TRIGGER library_entry_updated_at
  BEFORE UPDATE ON "LibraryEntry"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- SUBMISSIONS
-- gaining_traction is NEVER stored — computed at query time.
-- ============================================================

CREATE TABLE "Submission" (
  "id"                TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "userId"            TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "title"             TEXT NOT NULL,
  "description"       TEXT NOT NULL,
  "potentialSolution" TEXT,
  "urgency"           "Urgency" NOT NULL,
  "category"          TEXT NOT NULL,
  "status"            "SubmissionStatus" NOT NULL DEFAULT 'submitted',
  "voteCount"         INTEGER NOT NULL DEFAULT 0,
  "commentCount"      INTEGER NOT NULL DEFAULT 0,
  "libraryEntryId"    TEXT REFERENCES "LibraryEntry"("id") ON DELETE SET NULL,
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX submission_status_idx    ON "Submission" ("status");
CREATE INDEX submission_created_idx   ON "Submission" ("createdAt" DESC);
CREATE INDEX submission_category_idx  ON "Submission" ("category");


-- ============================================================
-- VOTES
-- ============================================================

CREATE TABLE "Vote" (
  "id"           TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "userId"       TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "submissionId" TEXT NOT NULL REFERENCES "Submission"("id") ON DELETE CASCADE,
  "votedAt"      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX vote_user_submission_idx ON "Vote" ("userId", "submissionId");
CREATE INDEX vote_voted_at_idx               ON "Vote" ("votedAt");
CREATE INDEX vote_user_voted_at_idx          ON "Vote" ("userId", "votedAt");


-- ============================================================
-- COMMENTS
-- Open/closed is derived from Submission.status at query time.
-- ============================================================

CREATE TABLE "Comment" (
  "id"           TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "userId"       TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "submissionId" TEXT NOT NULL REFERENCES "Submission"("id") ON DELETE CASCADE,
  "content"      TEXT NOT NULL,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX comment_submission_idx ON "Comment" ("submissionId");


-- ============================================================
-- DOCUMENTS
-- ============================================================

CREATE TABLE "Document" (
  "id"             TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "libraryEntryId" TEXT NOT NULL REFERENCES "LibraryEntry"("id") ON DELETE CASCADE,
  "docType"        "DocType" NOT NULL,
  "cloudinaryUrl"  TEXT NOT NULL,
  "fileName"       TEXT NOT NULL,
  "uploadedAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX document_entry_type_idx ON "Document" ("libraryEntryId", "docType");


-- ============================================================
-- BUILD REGISTRY
-- ============================================================

CREATE TABLE "BuildRegistry" (
  "id"             TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "userId"         TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "libraryEntryId" TEXT NOT NULL REFERENCES "LibraryEntry"("id") ON DELETE CASCADE,
  "repoUrl"        TEXT,
  "registeredAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX build_registry_user_entry_idx ON "BuildRegistry" ("userId", "libraryEntryId");
CREATE INDEX build_registry_entry_idx             ON "BuildRegistry" ("libraryEntryId");


-- ============================================================
-- BADGE PINGS — one row per badge fetch.
-- ============================================================

CREATE TABLE "BadgePing" (
  "id"             TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "libraryEntryId" TEXT NOT NULL REFERENCES "LibraryEntry"("id") ON DELETE CASCADE,
  "pingedAt"       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX badge_ping_entry_idx ON "BadgePing" ("libraryEntryId", "pingedAt" DESC);


-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE "Notification" (
  "id"        TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "userId"    TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "type"      "NotificationType" NOT NULL,
  "title"     TEXT NOT NULL,
  "body"      TEXT NOT NULL,
  "link"      TEXT,
  "read"      BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX notification_user_read_idx     ON "Notification" ("userId", "read");
CREATE INDEX notification_user_created_idx  ON "Notification" ("userId", "createdAt" DESC);


-- ============================================================
-- RPC: gaining_traction
-- Returns submission ids whose votes are spread across at least
-- `min_distinct_days` distinct days within the last `window_days`.
-- ============================================================

CREATE OR REPLACE FUNCTION gaining_traction_ids(
  window_days INTEGER DEFAULT 14,
  min_distinct_days INTEGER DEFAULT 3
)
RETURNS TABLE("submissionId" TEXT)
LANGUAGE sql
STABLE
AS $$
  SELECT "submissionId"
  FROM "Vote"
  WHERE "votedAt" >= now() - (window_days || ' days')::INTERVAL
  GROUP BY "submissionId"
  HAVING COUNT(DISTINCT DATE("votedAt")) >= min_distinct_days;
$$;


-- ============================================================
-- RLS: enabled on every table, no public policies.
-- All access goes through the Next.js API using SUPABASE_SERVICE_ROLE_KEY,
-- which bypasses RLS. The anon key cannot touch these tables.
-- (Add granular policies later if we expose tables to anon directly.)
-- ============================================================

ALTER TABLE "User"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LibraryEntry"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Submission"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vote"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comment"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BuildRegistry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BadgePing"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification"  ENABLE ROW LEVEL SECURITY;
