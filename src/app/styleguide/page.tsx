import { RaiseButton } from "@/components/feed/RaiseButton";
import {
  Body,
  Button,
  ButtonLink,
  Container,
  Eyebrow,
  GrainOverlay,
  Heading,
  Lede,
  Paper,
  Reveal,
  RevealGroup,
  RuleColumn,
  RuleLine,
  ScrollSlideReveal,
  ScrollWipeReveal,
  Section,
  Stack,
  Stat,
  Tagline,
  TextReveal,
  color,
  effect,
  emphasis,
  motion,
} from "@/design";

import { ScrollWordRevealDemo } from "./ScrollWordRevealDemo";

export default function StyleguidePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <GrainOverlay />

      <Section pad="sm">
        <Container>
          <Eyebrow>Christex Foundation &middot; Design System</Eyebrow>
          <Heading className="mt-4">Tokens & primitives</Heading>
          <Lede className="mt-6 max-w-[760px]" tone="muted">
            One catalog of the colors, type, and components used across the
            Problem Bank surface. Import from <code>@/design</code>.
          </Lede>
        </Container>
      </Section>

      <RuleLine />

      <ColorsSection />
      <RuleLine />
      <EffectsSection />
      <RuleLine />
      <TypographySection />
      <RuleLine />
      <EyebrowsSection />
      <RuleLine />
      <ButtonsSection />
      <RuleLine />
      <SurfacesSection />
      <RuleLine />
      <MotionSection />
      <RuleLine />
      <SectionsSection />
    </main>
  );
}

function Group({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Section pad="sm">
      <Container>
        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 md:col-span-3">
            <Eyebrow tone="foreground" size="sm">
              {title}
            </Eyebrow>
            {description && (
              <Body tone="muted" size="sm" className="mt-2 max-w-[28ch]">
                {description}
              </Body>
            )}
          </div>
          <div className="col-span-12 md:col-span-9">{children}</div>
        </div>
      </Container>
    </Section>
  );
}

function ColorsSection() {
  const surfaces = [
    { name: "background", value: color.background, light: false },
    { name: "paper", value: color.paper, light: false },
    { name: "foreground", value: color.foreground, light: true },
    { name: "accent", value: color.accent, light: true },
    { name: "muted", value: color.muted, light: true },
    { name: "rule", value: color.rule, light: true },
  ];
  const categories = [
    { name: "economy", value: color.category.economy, light: true },
    { name: "infrastructure", value: color.category.infrastructure, light: true },
    { name: "social", value: color.category.social, light: true },
    { name: "safety", value: color.category.safety, light: true },
  ];
  return (
    <Group title="Color" description="Surfaces and category palette. Edit in globals.css.">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {surfaces.map((s) => (
          <Swatch key={s.name} {...s} />
        ))}
      </div>
      <div className="mt-6">
        <Eyebrow tone="muted" size="sm">
          Category
        </Eyebrow>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((c) => (
            <Swatch key={c.name} {...c} />
          ))}
        </div>
      </div>
      <div className="mt-8">
        <Eyebrow tone="muted" size="sm">
          Foreground emphasis ramp
        </Eyebrow>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {Object.entries(emphasis).map(([key, pct]) => (
            <span
              key={key}
              className="text-base"
              style={{ color: `color-mix(in srgb, var(--foreground) ${pct}%, transparent)` }}
            >
              {key} / {pct}%
            </span>
          ))}
        </div>
      </div>
    </Group>
  );
}

function Swatch({
  name,
  value,
  light,
}: {
  name: string;
  value: string;
  light: boolean;
}) {
  return (
    <div className="flex flex-col">
      <div
        className="h-16 w-full border border-foreground/15"
        style={{ background: value }}
      />
      <div className="mt-1.5 flex items-baseline justify-between">
        <span
          className={`text-[11px] uppercase tracking-[0.22em] font-semibold ${light ? "text-foreground" : "text-foreground"}`}
        >
          {name}
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/55">
          {value.replace("var(", "").replace(")", "")}
        </span>
      </div>
    </div>
  );
}

function EffectsSection() {
  return (
    <Group
      title="Effects"
      description="Surface treatments shared across pages. Edit values in src/design/tokens.ts (and mirror in globals.css)."
    >
      <Stack gap={8}>
        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            Page background
          </Eyebrow>
          <div className="flex items-center gap-4">
            <div
              className="h-12 w-12 border border-foreground/15"
              style={{ background: effect.background }}
            />
            <code className="text-sm text-foreground/75">
              effect.background = {effect.background}
            </code>
          </div>
        </div>

        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            Text selection
          </Eyebrow>
          <Body tone="muted" className="max-w-[60ch]">
            Highlight this sentence to see the selection treatment in action.
            The accent tint stays translucent so the underlying text color
            survives on both light and dark surfaces.
          </Body>
          <code className="mt-2 inline-block text-sm text-foreground/55">
            ::selection background = {effect.selection.background}
          </code>
        </div>

        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            Film grain overlay
          </Eyebrow>
          <Body tone="muted" className="max-w-[60ch]">
            Mount <code>&lt;GrainOverlay /&gt;</code> inside any page that
            wants ambient texture. The overlay is fixed-position with
            mix-blend-mode multiply.
          </Body>
          <dl className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm text-foreground/75">
            <div>
              <dt className="text-foreground/45">opacity</dt>
              <dd className="num">{effect.grain.opacity}</dd>
            </div>
            <div>
              <dt className="text-foreground/45">blend-mode</dt>
              <dd>{effect.grain.blendMode}</dd>
            </div>
            <div>
              <dt className="text-foreground/45">tile</dt>
              <dd className="num">{effect.grain.tileSize}px</dd>
            </div>
            <div>
              <dt className="text-foreground/45">baseFrequency</dt>
              <dd className="num">{effect.grain.baseFrequency}</dd>
            </div>
            <div>
              <dt className="text-foreground/45">octaves</dt>
              <dd className="num">{effect.grain.numOctaves}</dd>
            </div>
            <div>
              <dt className="text-foreground/45">animation</dt>
              <dd className="num">
                {effect.grain.animationDuration} · steps({effect.grain.animationSteps})
              </dd>
            </div>
          </dl>
        </div>
      </Stack>
    </Group>
  );
}

function TypographySection() {
  return (
    <Group
      title="Typography"
      description="Headings, lede, body, tagline. Use these instead of raw text classes."
    >
      <Stack gap={10}>
        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            Heading · h1
          </Eyebrow>
          <Heading size="h1">Build what matters</Heading>
        </div>
        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            Heading · h2
          </Eyebrow>
          <Heading size="h2">Two paths, one library</Heading>
        </div>
        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            Heading · h3
          </Eyebrow>
          <Heading size="h3">Every problem ships as six PDFs</Heading>
        </div>
        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            Lede
          </Eyebrow>
          <Lede>
            A research-backed library of Sierra Leone&rsquo;s most important
            unsolved problems, sourced from communities and Christex Foundation.
          </Lede>
        </div>
        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            Body
          </Eyebrow>
          <Body>
            Standard paragraph copy. Used for body sections, descriptions, and
            anywhere the lede would be too loud.
          </Body>
        </div>
        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            Tagline
          </Eyebrow>
          <Tagline align="left">
            Different doors. Same{" "}
            <span className="text-accent font-bold not-italic">standard.</span>
          </Tagline>
        </div>
        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            Stat
          </Eyebrow>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat label="Library entries" value={42} />
            <Stat label="Builders" value={128} />
            <Stat label="Live POC" value={9} />
            <Stat label="Critical" value={5} accent />
          </div>
        </div>
      </Stack>
    </Group>
  );
}

function EyebrowsSection() {
  return (
    <Group title="Eyebrow" description="Small all-caps labels. Tone + size variants.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
        <Eyebrow tone="accent">Accent · md</Eyebrow>
        <Eyebrow tone="foreground">Foreground · md</Eyebrow>
        <Eyebrow tone="muted">Muted · md</Eyebrow>
        <Eyebrow tone="faint">Faint · md</Eyebrow>
        <Eyebrow tone="accent" size="sm">
          Accent · sm
        </Eyebrow>
        <Eyebrow tone="muted" size="sm">
          Muted · sm
        </Eyebrow>
      </div>
    </Group>
  );
}

function ButtonsSection() {
  return (
    <Group title="Button" description="Primary, accent, outline, ghost. Use ButtonLink for Next routes.">
      <div className="flex flex-wrap gap-4">
        <Button variant="primary">Primary action</Button>
        <Button variant="accent">Accent action</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div className="mt-6 flex flex-wrap gap-4">
        <ButtonLink href="/library" variant="primary">
          Browse the library
        </ButtonLink>
        <RaiseButton variant="outline">Raise a problem</RaiseButton>
      </div>
    </Group>
  );
}

function SurfacesSection() {
  return (
    <Group
      title="Surfaces"
      description="Paper card and rule lines. Use Paper to lift content above the page."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Paper className="p-6">
          <Eyebrow tone="accent">Paper card</Eyebrow>
          <Body className="mt-2" tone="muted">
            Background paper, hairline border, subtle shadow.
          </Body>
        </Paper>
        <div className="border border-foreground/15 p-6">
          <Eyebrow tone="muted">Bordered cell</Eyebrow>
          <Body className="mt-2" tone="muted">
            Plain hairline frame, no shadow. Used inside grids.
          </Body>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
        <div>
          <Eyebrow tone="muted" size="sm">
            Left
          </Eyebrow>
        </div>
        <RuleColumn />
        <div>
          <Eyebrow tone="muted" size="sm">
            Right
          </Eyebrow>
        </div>
      </div>
      <div className="mt-6">
        <RuleLine />
        <Body tone="muted" size="sm" className="mt-3">
          RuleLine above &middot; tone=&quot;muted&quot;
        </Body>
        <RuleLine tone="strong" className="mt-6" />
        <Body tone="muted" size="sm" className="mt-3">
          RuleLine above &middot; tone=&quot;strong&quot;
        </Body>
      </div>
    </Group>
  );
}

function MotionSection() {
  return (
    <Group
      title="Motion"
      description="Whisper-scale fades and lifts. Values mirror src/app/globals.css (motion in tokens.ts is the source of truth)."
    >
      <Stack gap={10}>
        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            Tokens
          </Eyebrow>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm text-foreground/75">
            <div>
              <dt className="text-foreground/45">duration.fast</dt>
              <dd className="num">{motion.duration.fast}ms</dd>
            </div>
            <div>
              <dt className="text-foreground/45">duration.base</dt>
              <dd className="num">{motion.duration.base}ms</dd>
            </div>
            <div>
              <dt className="text-foreground/45">duration.slow</dt>
              <dd className="num">{motion.duration.slow}ms</dd>
            </div>
            <div>
              <dt className="text-foreground/45">duration.deliberate</dt>
              <dd className="num">{motion.duration.deliberate}ms</dd>
            </div>
            <div>
              <dt className="text-foreground/45">distance.whisper</dt>
              <dd className="num">{motion.distance.whisper}px</dd>
            </div>
            <div>
              <dt className="text-foreground/45">distance.soft</dt>
              <dd className="num">{motion.distance.soft}px</dd>
            </div>
            <div>
              <dt className="text-foreground/45">stagger.base</dt>
              <dd className="num">{motion.stagger.base}ms</dd>
            </div>
            <div>
              <dt className="text-foreground/45">ease.standard</dt>
              <dd className="text-[11px]">{motion.ease.standard}</dd>
            </div>
          </dl>
        </div>

        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            Reveal &middot; whisper
          </Eyebrow>
          <Body tone="muted" className="max-w-[60ch]">
            Scroll until the block below enters the viewport. It lifts{" "}
            {motion.distance.whisper}px and fades over {motion.duration.slow}ms.
          </Body>
          <Reveal className="mt-4 border border-foreground/15 p-6">
            <Body>This block reveals when it crosses the viewport.</Body>
          </Reveal>
        </div>

        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            RevealGroup &middot; staggered children
          </Eyebrow>
          <Body tone="muted" className="max-w-[60ch]">
            Each child fires {motion.stagger.base}ms after the previous one.
          </Body>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <RevealGroup>
              <Reveal className="border border-foreground/15 p-4">
                <Body size="sm">One</Body>
              </Reveal>
              <Reveal className="border border-foreground/15 p-4">
                <Body size="sm">Two</Body>
              </Reveal>
              <Reveal className="border border-foreground/15 p-4">
                <Body size="sm">Three</Body>
              </Reveal>
            </RevealGroup>
          </div>
        </div>

        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            TextReveal &middot; heading entry
          </Eyebrow>
          <Body tone="muted" className="max-w-[60ch]">
            Opacity and letter-spacing settle over {motion.duration.deliberate}
            ms. Use on H1 / Lede only.
          </Body>
          <Heading size="h2" className="mt-4">
            <TextReveal>Two paths, one library</TextReveal>
          </Heading>
        </div>

        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            Hover transitions
          </Eyebrow>
          <Body tone="muted" className="max-w-[60ch]">
            Buttons use <code>.transition-soft</code>. Links pair with{" "}
            <code>.link-underline</code> for an underline slide.
          </Body>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <Button variant="primary">Hover me</Button>
            <Button variant="outline">Outline</Button>
            <a className="link-underline text-foreground" href="#">
              link with underline slide
            </a>
          </div>
        </div>

        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            Page transition
          </Eyebrow>
          <Body tone="muted" className="max-w-[60ch]">
            Wrapped at the root layout. The first mount on a hard load is
            not animated (avoids stacking with in-page entrance fades);
            subsequent client-side navigations mount with a{" "}
            {motion.duration.deliberate}ms fade + lift. Navigate to{" "}
            <code>/landing</code> or back to <code>/</code> to see it.
          </Body>
        </div>

        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            ScrollWipeReveal &middot; left-to-right clip-path wipe
          </Eyebrow>
          <Body tone="muted" className="max-w-[60ch]">
            Children are clipped from the right and uncover left-to-right
            as the wrapper enters the viewport from below. Pairs with
            <code> ScrollWordReveal</code> for headline + body choreography.
            Self-tracks its own ref by default; pass <code>progress</code> to
            override.
          </Body>
          <ScrollWipeReveal className="mt-4">
            <div className="border border-foreground/15 p-6">
              <Heading size="h3">A headline that draws itself in.</Heading>
              <Body tone="muted" className="mt-2">
                Scroll this block past the viewport bottom — the clip-path
                retracts from left to right.
              </Body>
            </div>
          </ScrollWipeReveal>
        </div>

        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            ScrollSlideReveal &middot; horizontal slide + fade
          </Eyebrow>
          <Body tone="muted" className="max-w-[60ch]">
            Translates from <code>left</code> or <code>right</code> with a
            configurable <code>distance</code> (defaults to 30% of the
            element&rsquo;s width). Pairs naturally with
            <code> ScrollWipeReveal</code> for layered headline choreography
            (see the EACH / ENTRY ARRIVES / decision-ready block on
            <code> /landing/main</code>).
          </Body>
          <div className="mt-4 flex flex-col gap-3">
            <ScrollSlideReveal from="left" distance="40%" className="self-start w-[40%]">
              <div className="border border-foreground/15 p-4">
                <Body size="sm">Slides in from the left.</Body>
              </div>
            </ScrollSlideReveal>
            <ScrollSlideReveal from="right" distance="40%" className="self-end w-[40%]">
              <div className="border border-foreground/15 p-4">
                <Body size="sm">Slides in from the right.</Body>
              </div>
            </ScrollSlideReveal>
          </div>
        </div>

        <div>
          <Eyebrow tone="muted" size="sm" className="mb-2">
            ScrollWordReveal &middot; scroll-driven copy
          </Eyebrow>
          <Body tone="muted" className="max-w-[60ch]">
            Word-by-word reveal tied to a section&rsquo;s scroll progress.
            Pair with <code>useScrollProgress(ref)</code> on the same
            section. Each word carries a <code>--t</code> threshold and
            the container sets <code>--p</code>; CSS does the rest.
          </Body>
          <div className="mt-4">
            <ScrollWordRevealDemo />
          </div>
        </div>
      </Stack>
    </Group>
  );
}

function SectionsSection() {
  return (
    <>
      <Section tone="paper" pad="sm">
        <Container>
          <Eyebrow tone="muted" size="sm">
            Section · tone=&quot;paper&quot;
          </Eyebrow>
          <Lede className="mt-4 max-w-[760px]" tone="muted">
            Slightly warmer surface for content blocks that want to feel
            lifted from the background.
          </Lede>
        </Container>
      </Section>
      <Section tone="foreground" pad="md">
        <Container>
          <Eyebrow tone="accent" size="sm">
            Section · tone=&quot;foreground&quot;
          </Eyebrow>
          <Heading size="h2" className="mt-4 text-background">
            Get informed. Build. Ship.
          </Heading>
          <Body tone="muted" size="md" className="mt-6 max-w-[560px] text-background/55">
            Dark CTA surface. Use sparingly for end-of-page calls to action.
          </Body>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink
              href="/library"
              className="bg-background text-foreground hover:bg-accent hover:text-background"
            >
              Inverted primary
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
