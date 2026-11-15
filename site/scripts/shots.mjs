// Screenshots of site pages at desktop, tablet and phone widths, in dark and light, for looking at the result.
// node site/scripts/shots.mjs /docs/combobox/ [/docs/button/ ...]  (the static server must be running)
import { chromium } from "@playwright/test";

const base = process.env.BASE ?? "http://localhost:3200";
const out = process.env.OUT ?? ".playwright-mcp/shots";
const widths = (process.env.WIDTHS ?? "1440,768,390").split(",").map(Number);
const themes = (process.env.THEMES ?? "dark").split(",");
const browser = await chromium.launch();
for (const path of process.argv.slice(2)) {
  for (const theme of themes) {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: theme === "dark" ? "dark" : "light" });
      await page.addInitScript((t) => localStorage.setItem("cennge-theme", t), theme);
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => message.type() === "error" && !/404|favicon/.test(message.text()) && errors.push(message.text()));
      await page.goto(base + path, { waitUntil: "networkidle" });
      // Scroll the page through once, so sections that enter on scroll (the landing) are in place.
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight / 2) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(600);
      const name = `${out}/${path.replace(/\//g, "_").replace(/^_|_$/g, "") || "home"}-${theme}-${width}.png`;
      await page.screenshot({ path: name, fullPage: process.env.FULL !== "0" });
      console.log(name, errors.length ? `ERRORS: ${errors.join(" | ")}` : "");
      await page.close();
    }
  }
}
await browser.close();
