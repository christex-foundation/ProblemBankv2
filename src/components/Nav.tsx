import Link from "next/link";

interface NavProps {
  active: "galaxy" | "map" | "stack" | "matrix" | "world";
  /** When the host page has a dark background, use lighter inactive hues. */
  variant?: "light" | "dark";
}

export function Nav({ active, variant = "light" }: NavProps) {
  const cls = (key: NavProps["active"]) => {
    const activeCls =
      variant === "dark" ? "text-white font-semibold" : "text-foreground font-semibold";
    const idleCls =
      variant === "dark"
        ? "text-white/35 hover:text-white/75 transition-colors"
        : "text-foreground/40 hover:text-foreground/75 transition-colors";
    return active === key ? activeCls : idleCls;
  };
  const dotCls = variant === "dark" ? "text-white/15" : "text-foreground/20";
  return (
    <nav className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em]">
      <Link href="/" className={cls("galaxy")}>
        Galaxy
      </Link>
      <span aria-hidden className={dotCls}>·</span>
      <Link href="/map" className={cls("map")}>
        Map
      </Link>
      <span aria-hidden className={dotCls}>·</span>
      <Link href="/stack" className={cls("stack")}>
        Stack
      </Link>
      <span aria-hidden className={dotCls}>·</span>
      <Link href="/matrix" className={cls("matrix")}>
        Matrix
      </Link>
      <span aria-hidden className={dotCls}>·</span>
      <Link href="/world" className={cls("world")}>
        World
      </Link>
    </nav>
  );
}
