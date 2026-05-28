import { loadMapUniverse } from "@/lib/load";
import { MAP_LABELS } from "@/lib/communities";
import { MapScrolly } from "@/components/MapScrolly";

export default function MapPage() {
  return (
    <main className="flex-1">
      <MapScrolly universe={loadMapUniverse()} labels={MAP_LABELS} />
    </main>
  );
}
