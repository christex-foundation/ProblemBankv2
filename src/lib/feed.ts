import { prisma } from '@/lib/prisma';
import {
  GAINING_TRACTION_WINDOW_DAYS,
  GAINING_TRACTION_MIN_DISTINCT_DAYS,
} from '@/lib/enums';

/**
 * Gaining Traction is computed at query time — never stored. A submission qualifies when
 * its votes are spread across at least N distinct days inside a rolling M-day window.
 */
export async function getGainingTractionIds(): Promise<Set<string>> {
  const since = new Date();
  since.setDate(since.getDate() - GAINING_TRACTION_WINDOW_DAYS);

  const rows = await prisma.$queryRaw<
    { submissionId: string; distinctDays: bigint }[]
  >`
    SELECT "submissionId", COUNT(DISTINCT DATE("votedAt")) AS "distinctDays"
    FROM "Vote"
    WHERE "votedAt" >= ${since}
    GROUP BY "submissionId"
    HAVING COUNT(DISTINCT DATE("votedAt")) >= ${GAINING_TRACTION_MIN_DISTINCT_DAYS}
  `;

  return new Set(rows.map((r) => r.submissionId));
}
