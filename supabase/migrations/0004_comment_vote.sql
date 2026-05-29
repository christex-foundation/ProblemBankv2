-- ============================================================
-- COMMENT VOTES
-- One upvote per (user, comment). Counts are derived via aggregate;
-- nothing is denormalised onto Comment so we never have to backfill.
-- ============================================================

CREATE TABLE "CommentVote" (
  "commentId" TEXT NOT NULL REFERENCES "Comment"("id") ON DELETE CASCADE,
  "userId"    TEXT NOT NULL REFERENCES "User"("id")    ON DELETE CASCADE,
  "votedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY ("commentId", "userId")
);

CREATE INDEX comment_vote_user_idx ON "CommentVote" ("userId");

ALTER TABLE "CommentVote" ENABLE ROW LEVEL SECURITY;
