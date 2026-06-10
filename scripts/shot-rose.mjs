import { chromium } from 'playwright';

const URL = 'http://localhost:3000/library/community-needs-assessment';
const out = process.argv[2] || '/tmp/rose.png';
const trackIdx = Number(process.argv[3] ?? 0); // 0 = problems rose, 1 = support rose
const vh = Number(process.argv[4] ?? 900);
const prog = Number(process.argv[5] ?? 0.82); // target pin progress (0..1)

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: vh } });
await page.goto(URL, { waitUntil: 'networkidle' });

// warm up scroll-driven observers
const total = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y <= total; y += 400) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(70);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(200);

// Position the chosen rose track so its pin progress hits `prog`.
// progress = -rect.top / (trackHeight - innerHeight); trackHeight = 1.2*H.
await page.evaluate(
  ({ idx, p }) => {
    const tracks = [...document.querySelectorAll('[class*="120vh"]')];
    const node = tracks[idx];
    if (!node) return;
    const H = window.innerHeight;
    const span = node.offsetHeight - H; // ~0.2H
    const rect = node.getBoundingClientRect();
    const wantTop = -p * span;
    window.scrollBy(0, rect.top - wantTop);
  },
  { idx: trackIdx, p: prog },
);
await page.waitForTimeout(1000);

await page.screenshot({ path: out });
console.log('saved', out);
await browser.close();
