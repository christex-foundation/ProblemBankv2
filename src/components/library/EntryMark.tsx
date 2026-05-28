/**
 * A small constellation mark drawn per Library entry. Three to five dots,
 * deterministically positioned from a hash of the entry id, in the entry's
 * sector color. Acts as the per-card "illustration" slot — abstract, but
 * unique enough that each entry reads as its own piece. Ties back to the
 * full-page LibraryConstellation visual language.
 */

const SECTOR_COLOR: Record<string, string> = {
  Health: 'var(--accent)',
  Education: 'var(--cat-social)',
  Agriculture: 'var(--cat-infrastructure)',
  Finance: 'var(--cat-safety)',
  Logistics: 'var(--cat-safety)',
  Energy: 'var(--cat-safety)',
  Infrastructure: 'var(--cat-infrastructure)',
  Other: 'var(--foreground)',
};

function hashInt(s: string, mod: number, salt = 0): number {
  let h = salt;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

interface Dot {
  x: number;
  y: number;
  r: number;
  opacity: number;
}

function dotsFor(id: string): Dot[] {
  const count = 3 + hashInt(id, 3, 7);
  const dots: Dot[] = [];
  for (let i = 0; i < count; i++) {
    const seed = `${id}-${i}`;
    const x = 16 + (hashInt(seed, 1000, 11) / 1000) * 88;
    const y = 16 + (hashInt(seed, 1000, 23) / 1000) * 88;
    const r = 3 + (hashInt(seed, 100, 37) / 100) * 6;
    const opacity = 0.55 + (hashInt(seed, 100, 53) / 100) * 0.45;
    dots.push({ x, y, r, opacity });
  }
  return dots;
}

export function EntryMark({
  id,
  sector,
  size = 60,
  className,
}: {
  id: string;
  sector: string;
  size?: number;
  className?: string;
}) {
  const color = SECTOR_COLOR[sector] ?? 'var(--foreground)';
  const dots = dotsFor(id);
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`${sector} entry mark`}
    >
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={d.r}
          fill={color}
          fillOpacity={d.opacity}
        />
      ))}
    </svg>
  );
}
