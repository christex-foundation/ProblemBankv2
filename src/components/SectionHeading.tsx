interface SectionHeadingProps {
  num: string;
  title: string;
  kicker?: string;
}

export function SectionHeading({ num, title, kicker }: SectionHeadingProps) {
  return (
    <div className="flex items-baseline gap-6 border-t border-foreground/20 pt-6">
      <span className="num text-sm text-foreground/60 tracking-[0.04em]">
        {num}
      </span>
      <div className="flex-1">
        <h2 className="text-[clamp(1.5rem,2.4vw,2rem)] font-medium tracking-tight leading-tight">
          {title}
        </h2>
        {kicker && (
          <p className="mt-1 text-sm text-muted max-w-2xl">{kicker}</p>
        )}
      </div>
    </div>
  );
}
