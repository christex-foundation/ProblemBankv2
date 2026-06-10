import { chromium } from 'playwright';

const URL = 'http://localhost:3000/library/community-needs-assessment';
const out = process.argv[2] || '/tmp/cna.png';
const anchor = process.argv[3] || 'Water runs through everything.';
const offset = Number(process.argv[4] ?? 0); // extra scroll past the anchor top
const vh = Number(process.argv[5] ?? 1300);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: vh } });
await page.goto(URL, { waitUntil: 'networkidle' });

// Reveal animations are scroll-driven; step down so IntersectionObservers fire.
const total = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y <= total; y += 400) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(90);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(200);

// Park the anchor heading near the top, then nudge by offset.
await page.evaluate(
  ({ a, off }) => {
    const el = [...document.querySelectorAll('h1,h2,h3')].find((n) =>
      n.textContent?.trim().startsWith(a),
    );
    if (el) {
      const r = el.getBoundingClientRect();
      window.scrollBy(0, r.top - 40 + off);
    }
  },
  { a: anchor, off: offset },
);
await page.waitForTimeout(1000);

await page.screenshot({ path: out });
console.log('saved', out, 'docHeight', total);
await browser.close();
