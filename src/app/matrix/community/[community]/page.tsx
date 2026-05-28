import { notFound } from "next/navigation";
import { loadUniverse, loadMapUniverse } from "@/lib/load";
import { findCommunityBySlug } from "@/lib/problemSlugs";
import { MatrixCommunityOverview } from "@/components/MatrixCommunityOverview";

export default async function MatrixCommunityOverviewPage({
  params,
}: {
  params: Promise<{ community: string }>;
}) {
  const { community: communitySlug } = await params;
  const universe = loadUniverse();
  const allCommunities = new Set<string>();
  for (const n of universe.nodes) {
    if (n.kind === "respondent") allCommunities.add(n.community);
  }
  const community = findCommunityBySlug(communitySlug, allCommunities);
  if (!community) notFound();

  return (
    <main className="flex-1">
      <MatrixCommunityOverview
        community={community}
        universe={universe}
        mapUniverse={loadMapUniverse()}
      />
    </main>
  );
}
