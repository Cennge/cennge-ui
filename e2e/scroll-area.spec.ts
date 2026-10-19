import { expect, expectAccessible, openFixture, test } from "./test";
import type { Page } from "@playwright/test";

const commits = (page: Page) => page.getByRole("region", { name: "Commits" });
const branches = (page: Page) => page.getByRole("region", { name: "Branches" });
const scrollTop = (page: Page) => commits(page).evaluate((node) => node.scrollTop);

test.beforeEach(async ({ page }) => {
  await openFixture(page, "scroll-area");
});

test("Tab reaches an area that scrolls; arrows and End scroll it", async ({ page }) => {
  await page.getByRole("button", { name: "Before" }).focus();
  await page.keyboard.press("Tab");
  const area = commits(page);
  await expect(area).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
  await page.keyboard.press("End");
  await expect.poll(() => area.evaluate((node) => node.scrollTop + node.clientHeight >= node.scrollHeight - 1)).toBe(true);
});

test("fades mark the edges that hide more", async ({ page }) => {
  const area = commits(page);
  await expect(area).toHaveAttribute("data-more-bottom", "");
  await expect(area).not.toHaveAttribute("data-more-top");
  const mask = await area.evaluate((node) => getComputedStyle(node).maskImage || getComputedStyle(node).webkitMaskImage);
  expect(mask).toContain("linear-gradient");
  await area.evaluate((node) => node.scrollTo({ top: 120 }));
  await expect(area).toHaveAttribute("data-more-top", "");
  await expect(area).toHaveAttribute("data-more-bottom", "");
  await area.evaluate((node) => node.scrollTo({ top: node.scrollHeight }));
  await expect(area).not.toHaveAttribute("data-more-bottom");
});

test("long lines end in an ellipsis instead of widening the content (radix-ui#926)", async ({ page }) => {
  const area = commits(page);
  const message = page.getByTestId("message").first();
  const [areaWidth, line] = await Promise.all([
    area.evaluate((node) => node.clientWidth),
    message.evaluate((node) => ({ client: node.clientWidth, scroll: node.scrollWidth, overflow: getComputedStyle(node).textOverflow })),
  ]);
  expect(line.overflow).toBe("ellipsis");
  expect(line.scroll).toBeGreaterThan(line.client); // the text is cut…
  expect(line.client).toBeLessThan(areaWidth); // …inside the area, which does not scroll sideways
  expect(await area.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
});

test("the scrollbar shows on hover in the theme's colours, and its thumb drags", async ({ page, isMobile }) => {
  test.skip(isMobile, "touch screens scroll with the finger; the bar only shows while scrolling");
  const root = commits(page).locator("xpath=..");
  await root.hover();
  const bar = root.locator('[data-orientation="vertical"][data-state="visible"]');
  await expect(bar).toBeVisible();
  const thumb = bar.locator("> div");
  const box = await thumb.boundingBox();
  if (!box) throw new Error("no thumb");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 60, { steps: 6 });
  await page.mouse.up();
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
});

test("on a phone the finger scrolls it and the bar appears while scrolling", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phones only");
  const area = commits(page);
  await area.evaluate((node) => node.scrollBy({ top: 200 }));
  await expect(area).toHaveAttribute("data-more-top", "");
  await expect(area.locator("xpath=..").locator('[data-orientation="vertical"][data-state="visible"]')).toBeVisible();
});

test("sideways: arrow keys scroll a horizontal area", async ({ page }) => {
  const area = branches(page);
  await area.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => area.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
  await expect(area).toHaveAttribute("data-more-left", "");
});

test("an area whose content fits is not a tab stop and not a region", async ({ page }) => {
  const fits = page.getByTestId("fits");
  await expect(fits.locator("[data-radix-scroll-area-viewport]")).not.toHaveAttribute("tabindex");
  await expect(page.getByRole("region", { name: "Tags" })).toHaveCount(0);
  // Tab goes from the horizontal area straight past it to the build log.
  await branches(page).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("region", { name: "Build log" })).toBeFocused();
});

test("both directions: a corner joins the two bars", async ({ page }) => {
  const log = page.getByRole("region", { name: "Build log" });
  const scrolls = await log.evaluate((node) => ({ x: node.scrollWidth > node.clientWidth, y: node.scrollHeight > node.clientHeight }));
  expect(scrolls).toEqual({ x: true, y: true });
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page, isMobile }) => {
    await openFixture(page, "scroll-area", theme);
    if (!isMobile) await commits(page).hover();
    await expectAccessible(page);
  });
}
