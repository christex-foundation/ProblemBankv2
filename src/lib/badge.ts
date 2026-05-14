// Minimal shields.io-style SVG badge. Two segments: "Problem Bank · <title>" on the left,
// status on the right (default "Building").

const CHAR_WIDTH = 6.5; // approximate Verdana 11px char width
const PADDING = 12;
const HEIGHT = 20;

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

export function generateBadgeSvg(label: string, status = 'Building'): string {
  const left = `Problem Bank · ${label}`.slice(0, 60);
  const right = status;
  const leftWidth = Math.ceil(left.length * CHAR_WIDTH) + PADDING;
  const rightWidth = Math.ceil(right.length * CHAR_WIDTH) + PADDING;
  const total = leftWidth + rightWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${HEIGHT}" role="img" aria-label="${escapeXml(left)}: ${escapeXml(right)}">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <rect width="${total}" height="${HEIGHT}" rx="3" fill="#555"/>
  <rect x="${leftWidth}" width="${rightWidth}" height="${HEIGHT}" rx="3" fill="#4c1"/>
  <rect width="${total}" height="${HEIGHT}" rx="3" fill="url(#s)"/>
  <g fill="#fff" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${PADDING / 2}" y="14">${escapeXml(left)}</text>
    <text x="${leftWidth + PADDING / 2}" y="14">${escapeXml(right)}</text>
  </g>
</svg>`;
}
