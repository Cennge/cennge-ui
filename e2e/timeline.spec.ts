import { expect, expectAccessible, openFixture, test } from "./test";

test.beforeEach(async ({ page }) => {
  await openFixture(page, "timeline");
});

test("history: ordered list with machine-readable times", async ({ page }) => {
  const releases = page.getByRole("list", { name: "Releases" });
  await expect(releases.getByRole("listitem")).toHaveCount(4);
  await expect(releases.locator("time").first()).toHaveAttribute("datetime", "2026-10-18T15:10");
});

test("vertical lines run from each bullet to the next without a gap", async ({ page }) => {
  const items = page.getByRole("list", { name: "Releases" }).getByRole("listitem");
  for (let i = 0; i < 3; i++) {
    const line = await items.nth(i).locator('[data-slot="line"]').boundingBox();
    const nextBullet = await items.nth(i + 1).locator('[data-slot="bullet"]').boundingBox();
    if (!line || !nextBullet) throw new Error("missing boxes");
    const gap = nextBullet.y - (line.y + line.height);
    expect(gap).toBeGreaterThanOrEqual(0);
    expect(gap).toBeLessThanOrEqual(6);
  }
});

test("tracking: the current item is aria-current, later ones are announced as upcoming", async ({ page }) => {
  const order = page.getByRole("list", { name: "Order" }).getByRole("listitem");
  await expect(order.nth(1)).toHaveAttribute("aria-current", "step");
  await expect(order.nth(0)).toHaveAttribute("data-state", "done");
  await expect(order.nth(2)).toHaveAttribute("data-state", "upcoming");
  await expect(order.nth(2)).toContainText("Delivered, upcoming");
});

test("done bullets take the colour, upcoming ones stay neutral", async ({ page }) => {
  const order = page.getByRole("list", { name: "Order" }).getByRole("listitem");
  const background = (n: number) =>
    order.nth(n).locator('[data-slot="marker"]').evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(await background(0)).toBe(await background(1));
  expect(await background(0)).not.toBe(await background(2));
});

test("a wide horizontal timeline scrolls inside itself, from the keyboard too", async ({ page }) => {
  const roadmap = page.getByRole("list", { name: "Roadmap" });
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(pageOverflow).toBeLessThanOrEqual(0);

  const overflows = await roadmap.evaluate((el) => el.scrollWidth > el.clientWidth);
  if (!overflows) return; // wide desktop viewport: nothing to scroll
  await roadmap.focus();
  await expect(roadmap).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => roadmap.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "timeline", theme);
    await expectAccessible(page);
  });
}
