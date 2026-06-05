import { notFound } from "next/navigation";
import { loadUniverse, loadMapUniverse } from "@/lib/load";
import { findProblemBySlug, findCommunityBySlug } from "@/lib/problemSlugs";
import { MatrixCommunityDetail } from "@/components/MatrixCommunityDetail";

export default async function MatrixCommunityDetailPage({
  params,
}: {
  params: Promise<{ problem: string; community: string }>;
}) {
  const { problem: problemSlug, community: communitySlug } = await params;
  const problem = findProblemBySlug(problemSlug);
  if (!problem) notFound();

  const universe = loadUniverse();
  const allCommunities = new Set<string>();
  for (const n of universe.nodes) {
    if (n.kind === "respondent") allCommunities.add(n.community);
  }
  const community = findCommunityBySlug(communitySlug, allCommunities);
  if (!community) notFound();

  return (
    <main className="flex-1">
      <MatrixCommunityDetail
        problem={problem}
        community={community}
        universe={universe}
        mapUniverse={loadMapUniverse()}
      />
    </main>
  );
}
