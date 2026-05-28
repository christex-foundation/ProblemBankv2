"use client";

export type ViewMode = "matrix" | "map";

interface MatrixMapToggleProps {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
  className?: string;
}

/**
 * Two-button [Matrix | Map] segmented toggle. Used in the header of every
 * Matrix-family page to swap the main canvas between the bubble pack and the
 * Freetown peninsula map. Designed for the dark Matrix theme.
 */
export function MatrixMapToggle({
  mode,
  onChange,
  className,
}: MatrixMapToggleProps) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center border border-white/15 rounded overflow-hidden ${className ?? ""}`}
    >
      <Segment
        active={mode === "matrix"}
        onClick={() => onChange("matrix")}
        label="Matrix"
      />
      <span aria-hidden className="h-3 w-px bg-white/15" />
      <Segment
        active={mode === "map"}
        onClick={() => onChange("map")}
        label="Map"
      />
    </div>
  );
}

function Segment({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      type="button"
      onClick={onClick}
      className={
        "px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] transition-colors " +
        (active
          ? "bg-white/10 text-white font-medium"
          : "text-white/55 hover:text-white")
      }
    >
      {label}
    </button>
  );
}
