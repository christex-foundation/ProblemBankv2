'use client';

/**
 * TEMPORARY diagnostic — remove after the dead nav-link investigation.
 *
 * Reports, via console (forwarded to the dev server log):
 *  1. what element the browser considers topmost over the "Problem Bank"
 *     nav link after load, and
 *  2. the full element stack under every click, so a click that "does
 *     nothing" shows exactly what swallowed it.
 */

import { useEffect } from 'react';

const tag = (el: Element | null): string =>
  el
    ? `${el.tagName}${el.id ? `#${el.id}` : ''}.${String((el as HTMLElement).className).slice(0, 60)}`
    : 'null';

export function NavDiagnostic() {
  useEffect(() => {
    const report = () => {
      const a = document.querySelector('nav a[href="/"]');
      if (!a) {
        console.log('[NAV-DIAG] no nav a[href="/"] found');
        return;
      }
      const r = a.getBoundingClientRect();
      const cx = r.x + r.width / 2;
      const cy = r.y + r.height / 2;
      const stack = document.elementsFromPoint(cx, cy).map(tag);
      const cs = getComputedStyle(a);
      console.log(
        '[NAV-DIAG] load-check',
        JSON.stringify({
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
          cursor: cs.cursor,
          pointerEvents: cs.pointerEvents,
          stackAtCenter: stack,
          ua: navigator.userAgent.slice(0, 80),
          vw: window.innerWidth,
          vh: window.innerHeight,
          zoom: Math.round((window.outerWidth / window.innerWidth) * 100) / 100,
        }),
      );
    };
    const t1 = window.setTimeout(report, 1500);
    const t2 = window.setTimeout(report, 4000);

    const onClick = (e: MouseEvent) => {
      const stack = document.elementsFromPoint(e.clientX, e.clientY).map(tag);
      console.log(
        '[NAV-DIAG] click',
        JSON.stringify({
          x: e.clientX,
          y: e.clientY,
          target: tag(e.target as Element),
          defaultPrevented: e.defaultPrevented,
          stack,
        }),
      );
    };
    // capture phase so we see the click even if something stops propagation
    document.addEventListener('click', onClick, true);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      document.removeEventListener('click', onClick, true);
    };
  }, []);

  return null;
}
