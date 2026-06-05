import { loadUniverse, loadMapUniverse } from "@/lib/load";
import { MatrixView } from "@/components/MatrixView";

export default function MatrixPage() {
  return (
    <main className="flex-1">
      <MatrixView
        universe={loadUniverse()}
        mapUniverse={loadMapUniverse()}
      />
    </main>
  );
}
