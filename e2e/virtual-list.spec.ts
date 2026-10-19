import { expect, expectAccessible, openFixture, test } from "./test";
import type { Page } from "@playwright/test";

const region = (page: Page) => page.getByRole("region", { name: "Commits" });
const rows = (page: Page) => region(page).getByRole("listitem");

/** Boxes of the rendered rows in order, and of the view. */
async function layout(page: Page) {
  return region(page).evaluate((viewport) => {
    const view = viewport.getBoundingClientRect();
    const items = Array.from(viewport.querySelectorAll<HTMLElement>('[role="listitem"]'))
      .map((row) => ({ index: Number(row.getAttribute("aria-posinset")), box: row.getBoundingClientRect() }))
      .sort((a, b) => a.index - b.index)
      .map(({ index, box }) => ({ index, top: box.top, bottom: box.bottom }));
    return { top: view.top, bottom: view.bottom, items };
  });
}

test.beforeEach(async ({ page }) => {
  await openFixture(page, "virtual-list");
});

test("only the rows in view are rendered; each tells the full size", async ({ page }) => {
  await expect(rows(page).first()).toHaveAttribute("aria-setsize", "10000");
  await expect(rows(page).first()).toHaveAttribute("aria-posinset", "1");
  const count = await rows(page).count();
  expect(count).toBeGreaterThan(5);
  expect(count).toBeLessThan(40);
});

test("rows of different heights stack without gaps or overlaps, and fill the view", async ({ page }) => {
  await region(page).evaluate((node) => (node.scrollTop = 150_000));
  await page.waitForTimeout(300); // measured after the first paint
  const { top, bottom, items } = await layout(page);
  for (let i = 1; i < items.length; i++) {
    expect(items[i]!.index).toBe(items[i - 1]!.index + 1);
    expect(Math.abs(items[i]!.top - items[i - 1]!.bottom)).toBeLessThan(1);
  }
  expect(items[0]!.top).toBeLessThanOrEqual(top + 1);
  expect(items[items.length - 1]!.bottom).toBeGreaterThanOrEqual(bottom - 1);
});

test("the keyboard reaches the end: Tab to the list, End", async ({ page }) => {
  await page.getByRole("button", { name: "Before" }).focus();
  await page.keyboard.press("Tab");
  await expect(region(page)).toBeFocused();
  await page.keyboard.press("End");
  await expect(region(page).getByText("Commit 10000", { exact: true })).toBeVisible();
  // Exactly at the end: the last row's bottom on the list's bottom edge, after its height was measured.
  await expect
    .poll(() =>
      region(page).evaluate((node) => {
        const last = node.querySelector('[aria-posinset="10000"]');
        return last ? Math.round(node.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom) : null;
      }),
    )
    .toBe(0);
  await page.keyboard.press("Home");
  await expect(region(page).getByText("Commit 1", { exact: true })).toBeVisible();
});

test("a jump brings a far row into the middle of the view", async ({ page, isMobile }) => {
  const jump = page.getByRole("button", { name: "Jump" });
  if (isMobile) await jump.tap();
  else await jump.click();
  const row = region(page).getByText("Commit 4812", { exact: true });
  await expect(row).toBeVisible();
  const [rowBox, viewBox] = [await row.boundingBox(), await region(page).boundingBox()];
  if (!rowBox || !viewBox) throw new Error("no box");
  expect(rowBox.y).toBeGreaterThan(viewBox.y);
  expect(rowBox.y + rowBox.height).toBeLessThan(viewBox.y + viewBox.height);
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "virtual-list", theme);
    await expectAccessible(page);
  });
}
