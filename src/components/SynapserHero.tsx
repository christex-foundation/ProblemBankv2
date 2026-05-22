"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children?: ReactNode;
  words?: string[];
  caption?: string;
  /** Reserved space at the top of the hero (e.g. for a fixed nav). Words
   * cannot drift above this y offset. */
  topInset?: number;
};

const DEFAULT_WORDS = [
  "communities",
  "evidence",
  "research",
  "library",
  "problems",
  "builders",
  "dossier",
  "concept",
  "wireframes",
  "roadmap",
  "education",
  "healthcare",
  "water",
  "poverty",
  "unemployment",
  "Sierra Leone",
  "Christex",
  "open",
];

type Body = {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  grabbed: boolean;
  alpha: number;
  lineProgress: number;
  delay: number;
};

export default function SynapserHero({
  children,
  words = DEFAULT_WORDS,
  caption = "Scroll to Explore",
  topInset = 72,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const captionRef = useRef<HTMLDivElement | null>(null);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const overlayEl = overlayRef.current;
    const captionEl = captionRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Entrance animation timing (ms).
    const ENTER_DELAY = 700;
    const STAGGER_AMOUNT = 1500;
    const ENTER_DURATION = 2000;
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const bodies: Body[] = [];
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Title box: tight rectangle covering the visible centered content
    // (eyebrow + headline + paragraph). Computed as the union of the
    // overlay's direct children's bounding boxes so the box hugs the actual
    // text rather than the wider centering wrapper. Lines are ray-clipped to
    // its perimeter on the start side and to each word's box on the end
    // side; words are AABB-collided against it so they can never land
    // inside any readable text.
    const title = { cx: 0, cy: 0, hw: 0, hh: 0 };
    const updateTitle = () => {
      const crect = container.getBoundingClientRect();
      if (!overlayEl) {
        title.cx = width / 2;
        title.cy = height / 2;
        title.hw = 0;
        title.hh = 0;
        return;
      }
      const kids = Array.from(overlayEl.children) as HTMLElement[];
      let left = Infinity;
      let top = Infinity;
      let right = -Infinity;
      let bottom = -Infinity;
      for (const k of kids) {
        const r = k.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (r.left < left) left = r.left;
        if (r.top < top) top = r.top;
        if (r.right > right) right = r.right;
        if (r.bottom > bottom) bottom = r.bottom;
      }
      if (!Number.isFinite(left)) {
        const r = overlayEl.getBoundingClientRect();
        left = r.left;
        top = r.top;
        right = r.right;
        bottom = r.bottom;
      }
      title.cx = (left + right) / 2 - crect.left;
      title.cy = (top + bottom) / 2 - crect.top;
      title.hw = (right - left) / 2;
      title.hh = (bottom - top) / 2;
    };

    const measure = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      updateTitle();
    };

    const seed = () => {
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        const rect = b.el.getBoundingClientRect();
        b.w = rect.width;
        b.h = rect.height;
        // Place outside the title rectangle and below the top inset. Retry a
        // few times before falling back to a forced push-out.
        for (let attempt = 0; attempt < 20; attempt++) {
          b.x = Math.random() * Math.max(1, width - b.w);
          b.y =
            topInset +
            Math.random() * Math.max(1, height - b.h - topInset);
          if (title.hw <= 0 || title.hh <= 0) break;
          const wx = b.x + b.w / 2;
          const wy = b.y + b.h / 2;
          const ox = title.hw + b.w / 2 - Math.abs(wx - title.cx);
          const oy = title.hh + b.h / 2 - Math.abs(wy - title.cy);
          if (ox <= 0 || oy <= 0) break;
        }
        const angle = Math.random() * Math.PI * 2;
        // Very gentle drift on load: 0.2–0.8 px per frame (~12–48 px/sec).
        const speed = 0.2 + Math.random() * 0.6;
        b.vx = Math.cos(angle) * speed;
        b.vy = Math.sin(angle) * speed;
      }
    };

    measure();

    for (const el of wordRefs.current) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      bodies.push({
        el,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        w: rect.width,
        h: rect.height,
        grabbed: false,
        alpha: 0,
        lineProgress: 0,
        delay: 0,
      });
      el.style.opacity = "0";
    }
    seed();
    // Random staggered delays so lines extend in non-sequential order.
    for (const b of bodies) b.delay = Math.random() * STAGGER_AMOUNT;

    const mouse = { x: -9999, y: -9999, active: false };
    const drag = {
      body: null as Body | null,
      offX: 0,
      offY: 0,
      lastX: 0,
      lastY: 0,
      lastT: 0,
      vx: 0,
      vy: 0,
    };

    const localPoint = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onPointerMove = (e: PointerEvent) => {
      const p = localPoint(e.clientX, e.clientY);
      mouse.x = p.x;
      mouse.y = p.y;
      mouse.active = true;
      if (drag.body) {
        const now = performance.now();
        const dt = Math.max(1, now - drag.lastT);
        const nx = p.x - drag.offX;
        const ny = p.y - drag.offY;
        drag.vx = ((nx - drag.lastX) / dt) * 16;
        drag.vy = ((ny - drag.lastY) / dt) * 16;
        drag.body.x = nx;
        drag.body.y = ny;
        drag.lastX = nx;
        drag.lastY = ny;
        drag.lastT = now;
      }
    };

    const onPointerLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const idx = target ? wordRefs.current.indexOf(target as HTMLDivElement) : -1;
      if (idx < 0) return;
      const body = bodies[idx];
      if (!body) return;
      const p = localPoint(e.clientX, e.clientY);
      drag.body = body;
      drag.offX = p.x - body.x;
      drag.offY = p.y - body.y;
      drag.lastX = body.x;
      drag.lastY = body.y;
      drag.lastT = performance.now();
      drag.vx = 0;
      drag.vy = 0;
      body.grabbed = true;
      body.vx = 0;
      body.vy = 0;
      target?.setPointerCapture?.(e.pointerId);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!drag.body) return;
      drag.body.grabbed = false;
      drag.body.vx = drag.vx;
      drag.body.vy = drag.vy;
      const target = e.target as HTMLElement | null;
      target?.releasePointerCapture?.(e.pointerId);
      drag.body = null;
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    const onResize = () => {
      measure();
      for (const b of bodies) {
        b.x = Math.min(Math.max(b.x, 0), Math.max(0, width - b.w));
        b.y = Math.min(
          Math.max(b.y, topInset),
          Math.max(topInset, height - b.h),
        );
      }
    };
    window.addEventListener("resize", onResize);

    // The headline SVG may not have its final size on the first paint
    // (web font swaps, layout settles). Re-measure on the next frame.
    requestAnimationFrame(updateTitle);

    // Reveal centered overlay + caption after a short settle.
    const revealId = window.setTimeout(() => {
      if (overlayEl) overlayEl.style.opacity = "1";
      if (captionEl) captionEl.style.opacity = "0.5";
    }, 450);

    const REPEL_RADIUS = 110;
    const REPEL_STRENGTH = 700;
    const DAMPING = 0.998;
    const MAX_SPEED = 90;
    // Floor speed: every word always drifts at least this fast (px/frame),
    // so the field is never static even after damping settles.
    const MIN_SPEED = 0.35;
    // Proximity link between the cursor-focused word and its neighbors.
    const HOVER_RADIUS = 70;
    const LINK_MAX = 280;
    const LINK_FADE_START = 220;

    const startedAt = performance.now();
    let last = startedAt;
    let raf = 0;
    const step = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;

      // Advance the staggered entrance for each word.
      const elapsed = now - startedAt - ENTER_DELAY;
      for (const b of bodies) {
        const p = Math.max(
          0,
          Math.min(1, (elapsed - b.delay) / ENTER_DURATION),
        );
        const eased = easeInOutCubic(p);
        b.alpha = eased;
        b.lineProgress = eased;
        if (!b.grabbed) b.el.style.opacity = String(eased);
      }

      for (const b of bodies) {
        if (b.grabbed) continue;
        if (mouse.active) {
          const cx = b.x + b.w / 2;
          const cy = b.y + b.h / 2;
          const dx = cx - mouse.x;
          const dy = cy - mouse.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < REPEL_RADIUS * REPEL_RADIUS && dist2 > 0.01) {
            const dist = Math.sqrt(dist2);
            const force = REPEL_STRENGTH / (dist * dist);
            b.vx += (dx / dist) * force * dt;
            b.vy += (dy / dist) * force * dt;
          }
        }

        b.vx *= DAMPING;
        b.vy *= DAMPING;
        const sp = Math.hypot(b.vx, b.vy);
        if (sp > MAX_SPEED) {
          b.vx = (b.vx / sp) * MAX_SPEED;
          b.vy = (b.vy / sp) * MAX_SPEED;
        } else if (sp < MIN_SPEED) {
          if (sp < 0.0001) {
            const a = Math.random() * Math.PI * 2;
            b.vx = Math.cos(a) * MIN_SPEED;
            b.vy = Math.sin(a) * MIN_SPEED;
          } else {
            b.vx = (b.vx / sp) * MIN_SPEED;
            b.vy = (b.vy / sp) * MIN_SPEED;
          }
        }

        b.x += b.vx;
        b.y += b.vy;

        // Title-box collision: words can never enter the headline rectangle.
        // Resolve overlap along the shorter axis and reverse that velocity
        // component so they bounce off the wordmark.
        if (title.hw > 0 && title.hh > 0) {
          const wx = b.x + b.w / 2;
          const wy = b.y + b.h / 2;
          const overlapX = title.hw + b.w / 2 - Math.abs(wx - title.cx);
          const overlapY = title.hh + b.h / 2 - Math.abs(wy - title.cy);
          if (overlapX > 0 && overlapY > 0) {
            if (overlapX < overlapY) {
              if (wx >= title.cx) {
                b.x += overlapX;
                b.vx = Math.abs(b.vx);
              } else {
                b.x -= overlapX;
                b.vx = -Math.abs(b.vx);
              }
            } else {
              if (wy >= title.cy) {
                b.y += overlapY;
                b.vy = Math.abs(b.vy);
              } else {
                b.y -= overlapY;
                b.vy = -Math.abs(b.vy);
              }
            }
          }
        }

        if (b.x <= 0) {
          b.x = 0;
          b.vx = Math.abs(b.vx);
        } else if (b.x + b.w >= width) {
          b.x = width - b.w;
          b.vx = -Math.abs(b.vx);
        }
        if (b.y <= topInset) {
          b.y = topInset;
          b.vy = Math.abs(b.vy);
        } else if (b.y + b.h >= height) {
          b.y = height - b.h;
          b.vy = -Math.abs(b.vy);
        }
      }

      // Determine the cursor-focused word (nearest body within HOVER_RADIUS).
      let focused: Body | null = null;
      if (mouse.active) {
        let best = HOVER_RADIUS * HOVER_RADIUS;
        for (const b of bodies) {
          const cx = b.x + b.w / 2;
          const cy = b.y + b.h / 2;
          const dx = cx - mouse.x;
          const dy = cy - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < best) {
            best = d2;
            focused = b;
          }
        }
      }

      // Paint spokes. Each spoke is ray-clipped to the title box's edge at
      // the start and to the word's own box at the end, so the line never
      // enters either rectangle. This is what Synapser actually does, the
      // letters never "hide" a center hub because the line geometrically
      // emerges from the title's perimeter.
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(83,83,82,0.85)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (const b of bodies) {
        const wx = b.x + b.w / 2;
        const wy = b.y + b.h / 2;
        const whw = b.w / 2;
        const whh = b.h / 2;

        // Start at title center, ray-clip outward to title-box edge.
        let M = title.cx;
        let N = title.cy;
        if (title.hw > 0 && title.hh > 0) {
          const dx = wx - title.cx;
          const dy = wy - title.cy;
          const ax = title.hw / Math.max(Math.abs(dx), 0.0001);
          const ay = title.hh / Math.max(Math.abs(dy), 0.0001);
          const a = Math.min(ax, ay);
          if (a < 1) {
            M = title.cx + dx * a;
            N = title.cy + dy * a;
          }
        }

        // End at word center, ray-clip back to word-box edge.
        let k = wx;
        let S = wy;
        const ex = M - wx;
        const ey = N - wy;
        const rx = whw / Math.max(Math.abs(ex), 0.0001);
        const ry = whh / Math.max(Math.abs(ey), 0.0001);
        const rClip = Math.min(rx, ry);
        if (rClip < 1) {
          k = wx + ex * rClip;
          S = wy + ey * rClip;
        }

        const dxx = k - M;
        const dyy = S - N;
        const C = b.lineProgress;
        if (C > 0.01 && dxx * dxx + dyy * dyy > 100) {
          ctx.moveTo(M, N);
          ctx.lineTo(M + dxx * C, N + dyy * C);
        }
      }
      ctx.stroke();

      // Proximity links from the focused word to nearby words. Lines are
      // clipped to each word's bounding box edge and fade over the last 60px
      // of the link range so they appear and disappear softly.
      if (focused) {
        const fx = focused.x + focused.w / 2;
        const fy = focused.y + focused.h / 2;
        const fhw = focused.w / 2;
        const fhh = focused.h / 2;
        for (const b of bodies) {
          if (b === focused) continue;
          const bx = b.x + b.w / 2;
          const by = b.y + b.h / 2;
          const dx = bx - fx;
          const dy = by - fy;
          const d = Math.hypot(dx, dy);
          if (d >= LINK_MAX || d < 0.001) continue;
          const fade =
            d > LINK_FADE_START
              ? (LINK_MAX - d) / (LINK_MAX - LINK_FADE_START)
              : 1;
          const alpha = fade * Math.min(1, b.lineProgress) * 0.55;
          if (alpha < 0.02) continue;

          // Clip start to focused word's edge.
          const a1 = Math.min(
            fhw / Math.max(Math.abs(dx), 0.0001),
            fhh / Math.max(Math.abs(dy), 0.0001),
          );
          const sx = fx + dx * Math.min(a1, 1);
          const sy = fy + dy * Math.min(a1, 1);

          // Clip end to neighbor word's edge.
          const a2 = Math.min(
            b.w / 2 / Math.max(Math.abs(-dx), 0.0001),
            b.h / 2 / Math.max(Math.abs(-dy), 0.0001),
          );
          const ex = bx - dx * Math.min(a2, 1);
          const ey = by - dy * Math.min(a2, 1);

          const lx = ex - sx;
          const ly = ey - sy;
          if (lx * lx + ly * ly < 25) continue;

          ctx.strokeStyle = `rgba(83,83,82,${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        }
      }

      for (const b of bodies) {
        b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0)`;
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    // Scroll-driven fade: opacity decays from 1 to 0 as the user scrolls
    // through the hero. The section is sticky inside a taller wrapper, so
    // we read the wrapper's offset to drive the fade while the section
    // stays pinned in viewport. rAF-throttled to avoid layout thrash.
    let scrollRaf = 0;
    const applyScrollFade = () => {
      scrollRaf = 0;
      const wrapper = container.parentElement;
      if (!wrapper) return;
      const wrect = wrapper.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, -wrect.top / vh));
      container.style.opacity = String(1 - progress);
    };
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(applyScrollFade);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    applyScrollFade();

    return () => {
      cancelAnimationFrame(raf);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      window.clearTimeout(revealId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("pointerdown", onPointerDown);
    };
  }, [words, topInset]);

  return (
    <div className="relative" style={{ height: "200vh" }}>
      <section
        ref={containerRef}
        className="sticky top-0 w-full h-screen overflow-hidden bg-background text-foreground select-none"
      >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {words.map((w, i) => (
        <div
          key={`${w}-${i}`}
          ref={(el) => {
            wordRefs.current[i] = el;
          }}
          className="absolute top-0 left-0 font-serif italic text-base sm:text-lg md:text-xl text-foreground/80 z-10 cursor-grab active:cursor-grabbing whitespace-nowrap"
          style={{ touchAction: "none", willChange: "transform" }}
        >
          {w}
        </div>
      ))}

      <div
        ref={overlayRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-[1100px] px-6 md:px-10 pointer-events-none flex flex-col items-center"
        style={{ opacity: 0, transition: "opacity 900ms ease-out" }}
      >
        {children}
      </div>

      <div
        ref={captionRef}
        className="absolute bottom-8 left-0 right-0 z-20 text-center text-[10px] sm:text-xs uppercase tracking-[0.32em] pointer-events-none"
        style={{ opacity: 0, transition: "opacity 900ms ease-out" }}
      >
        {caption}
      </div>
      </section>
    </div>
  );
}
