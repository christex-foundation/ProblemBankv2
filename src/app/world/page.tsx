import { loadUniverse } from "@/lib/load";
import { WorldView } from "@/components/WorldView";

export default function WorldPage() {
  return (
    <main className="flex-1">
      <WorldView universe={loadUniverse()} />
    </main>
  );
}
