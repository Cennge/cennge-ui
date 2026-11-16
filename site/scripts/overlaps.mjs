// Text drawn over other text, on every page, at desktop and phone widths (the same check as the e2e test).
// Usage: node scripts/overlaps.mjs [base]   (the static server must be running; default http://localhost:3200)
import { chromium } from "@playwright/test";
import { findOverlaps } from "../e2e/overlaps.ts";
import { pages } from "../lib/nav.ts";

const base = process.argv[2] ?? "http://localhost:3200";
const browser = await chromium.launch();
let total = 0;
for (const width of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const path of ["/", ...pages.map((entry) => `/docs/${entry.slug}/`)]) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const hits = await findOverlaps(page);
    if (!hits.length) continue;
    total += hits.length;
    console.log(`${width} ${path}`);
    for (const hit of hits.slice(0, 6)) console.log(`    ${hit}`);
    if (hits.length > 6) console.log(`    …and ${hits.length - 6} more`);
  }
  await page.close();
}
await browser.close();
console.log(total ? `${total} overlaps` : "no overlaps");
process.exitCode = total ? 1 : 0;
