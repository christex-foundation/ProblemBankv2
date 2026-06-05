import { notFound } from "next/navigation";
import { loadUniverse, loadMapUniverse } from "@/lib/load";
import { findProblemBySlug } from "@/lib/problemSlugs";
import { MatrixDetail } from "@/components/MatrixDetail";

export default async function MatrixDetailPage({
  params,
}: {
  params: Promise<{ problem: string }>;
}) {
  const { problem: slug } = await params;
  const problem = findProblemBySlug(slug);
  if (!problem) notFound();

  return (
    <main className="flex-1">
      <MatrixDetail
        problem={problem}
        universe={loadUniverse()}
        mapUniverse={loadMapUniverse()}
      />
    </main>
  );
}
