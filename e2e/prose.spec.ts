import { expect, expectAccessible, openFixture, test } from "./test";
import type { Page } from "@playwright/test";

const prose = (page: Page) => page.locator(".cennge-prose").first();
const px = (value: string) => parseFloat(value);

test.beforeEach(async ({ page }) => {
  await openFixture(page, "prose");
});

test("headings, links, lists, code and quotes get the theme's look", async ({ page }) => {
  const root = prose(page);
  const install = root.getByRole("heading", { name: "Install" });
  await expect(install).toHaveCSS("border-bottom-style", "solid");
  await expect(install).toHaveCSS("font-size", "24px"); // 1.5em of 16px
  await expect(root.getByRole("heading", { level: 1 })).toHaveCSS("font-weight", "800");
  await expect(root.getByRole("link", { name: "source on GitHub" })).toHaveCSS("text-decoration-line", "underline");
  await expect(root.locator("ul").first()).toHaveCSS("list-style-type", "disc");
  await expect(root.locator("ol").first()).toHaveCSS("list-style-type", "decimal");
  await expect(root.locator("li.task-list-item").first()).toHaveCSS("list-style-type", "none");
  const inline = root.locator("p code, h3 code").first();
  expect(await inline.evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
  await expect(root.locator("pre code").first()).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(root.locator("blockquote")).toHaveCSS("border-left-style", "solid");
});

test("Markdown table alignment wins; cells without it start-align", async ({ page }) => {
  const table = prose(page).locator("table");
  await expect(table.locator("th").nth(0)).toHaveCSS("text-align", "start");
  // The align attribute reads back as -webkit-center / -moz-center depending on the engine.
  await expect(table.locator("th").nth(1)).toHaveCSS("text-align", /center/);
  await expect(table.locator("td").nth(2)).toHaveCSS("text-align", /right/);
});

test("a class on an element inside wins over the prose styles", async ({ page }) => {
  const own = page.getByTestId("own-heading");
  await expect(own).toHaveCSS("font-size", "14px"); // text-sm, not the prose 1.5em
  const color = (name: string) => page.evaluate((id) => getComputedStyle(document.querySelector(id)!).color, name);
  expect(await color('[data-testid="own-heading"]')).toBe(await color(".lead")); // text-muted
  // Still a prose heading in every other respect.
  await expect(own).toHaveCSS("border-bottom-style", "solid");
});

test("not-prose switches the styles off for its subtree", async ({ page }) => {
  const plain = page.getByTestId("not-prose");
  const heading = plain.getByRole("heading", { name: "Not prose" });
  await expect(heading).toHaveCSS("border-bottom-width", "0px");
  await expect(heading).toHaveCSS("font-size", "16px");
  const link = plain.getByRole("link", { name: "plain link" });
  await expect(link).toHaveCSS("text-decoration-line", "none");
  // No prose link colour: it inherits like any link under Tailwind's preflight.
  expect(await link.evaluate((node) => getComputedStyle(node).color)).toBe(
    await plain.evaluate((node) => getComputedStyle(node).color),
  );
});

test("a code block wider than the column scrolls, and the keyboard can scroll it", async ({ page }) => {
  const blocks = prose(page).locator("pre");
  const long = blocks.nth(1);
  await expect(long).toHaveAttribute("tabindex", "0");
  await long.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => long.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
  // A block that fits is not a tab stop.
  const short = blocks.nth(0);
  const fits = await short.evaluate((node) => node.scrollWidth <= node.clientWidth + 1);
  if (fits) await expect(short).not.toHaveAttribute("tabindex");
  // Nothing pushes the page sideways on a phone.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("badges inside a line stay in the line", async ({ page }) => {
  const badges = prose(page).locator("p img");
  const [first, second] = [await badges.nth(0).boundingBox(), await badges.nth(1).boundingBox()];
  if (!first || !second) throw new Error("no box");
  expect(Math.abs(first.y - second.y)).toBeLessThan(1);
  expect(second.x).toBeGreaterThan(first.x + first.width);
});

test("sizes scale the text and its spacing", async ({ page }) => {
  const small = page.getByTestId("small");
  await expect(small).toHaveCSS("font-size", "14px");
  await expect(small.getByRole("heading")).toHaveCSS("font-size", "21px"); // 1.5em of 14px
  const h2 = await small.getByRole("heading").evaluate((node) => getComputedStyle(node).marginTop);
  expect(px(h2)).toBe(0); // the first child starts flush
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "prose", theme);
    await prose(page).getByRole("link", { name: "Theming" }).focus();
    await expectAccessible(page);
  });
}
