import { loadUniverse } from "@/lib/load";
import { StackScrolly } from "@/components/StackScrolly";

export default function StackPage() {
  return (
    <main className="flex-1">
      <StackScrolly universe={loadUniverse()} />
    </main>
  );
}
