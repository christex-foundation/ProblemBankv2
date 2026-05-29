-- ============================================================
-- SUBMISSION: success criteria
-- The "Raise a problem" form captures a list of "signs it's working"
-- (objective, builder-facing acceptance signals). Persist them as a
-- text[] so the same shape the form produces survives to the row.
-- ============================================================

ALTER TABLE "Submission"
  ADD COLUMN "signsItsWorking" TEXT[] NOT NULL DEFAULT '{}'::text[];
