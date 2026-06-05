import Link from "next/link";

interface NavProps {
  active: "galaxy" | "map" | "stack" | "matrix" | "world";
  /** When the host page has a dark background, use lighter inactive hues. */
  variant?: "light" | "dark";
}

export function Nav({ active, variant = "light" }: NavProps) {
  const cls = (key: NavProps["active"]) => {
    const activeCls =
      variant === "dark" ? "text-on-dark font-semibold" : "text-foreground font-semibold";
    const idleCls =
      variant === "dark"
        ? "text-on-dark/35 hover:text-on-dark/75 transition-soft"
        : "text-foreground/40 hover:text-foreground/75 transition-soft";
    return active === key ? activeCls : idleCls;
  };
  const dotCls = variant === "dark" ? "text-on-dark/15" : "text-foreground/20";
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
