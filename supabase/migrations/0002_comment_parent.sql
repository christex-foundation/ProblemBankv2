-- ============================================================
-- COMMENTS: nested replies (2-level cap)
-- Adds a self-referential parent FK to Comment. NULL = top-level.
-- Depth is enforced by the API route handler (Comment is only
-- written via Next.js using the service role), so no DB trigger.
-- ============================================================

ALTER TABLE "Comment"
  ADD COLUMN "parentCommentId" TEXT
    REFERENCES "Comment"("id") ON DELETE CASCADE;

CREATE INDEX comment_parent_idx
  ON "Comment" ("parentCommentId")
  WHERE "parentCommentId" IS NOT NULL;
