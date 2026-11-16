import type { Locator, Page } from "@playwright/test";
import { expect, expectAccessible, openFixture, settleAnimations, test } from "./test";

const log = (page: Page) => page.getByTestId("log");
const nav = (page: Page) => page.getByRole("navigation", { name: "Main" });

/** A finger drag, as pointer events: Playwright has no touch move of its own. */
async function swipe(target: Locator, dx: number, dy: number, steps = 8) {
  const box = (await target.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const fire = (type: string, px: number, py: number) =>
    target.dispatchEvent(type, { pointerId: 7, pointerType: "touch", isPrimary: true, button: 0, buttons: 1, clientX: px, clientY: py, bubbles: true });
  await fire("pointerdown", x, y);
  for (let i = 1; i <= steps; i++) await fire("pointermove", x + (dx * i) / steps, y + (dy * i) / steps);
  await fire("pointerup", x + dx, y + dy);
}

test.beforeEach(async ({ page }) => {
  await openFixture(page, "mobile-shell");
});

test.describe("BottomNavigation", () => {
  test("marks the place you are in, reads a badge's count, and moves on a tap", async ({ page }) => {
    const today = nav(page).getByRole("button", { name: "Today" });
    await expect(today).toHaveAttribute("aria-current", "page");
    await expect(nav(page).getByRole("button", { name: "Log 3" })).toBeVisible();
    await expect(nav(page).getByRole("button", { name: "Profile new" })).toBeVisible();
    await nav(page).getByRole("button", { name: "Progress" }).click();
    await expect(nav(page).getByRole("button", { name: "Progress" })).toHaveAttribute("aria-current", "page");
    await expect(today).not.toHaveAttribute("aria-current");
  });

  test("the bottom stack: the bar sits on the navigation, the floating button above both, nothing over anything", async ({ page }) => {
    const viewport = page.viewportSize()!;
    const navBox = (await nav(page).boundingBox())!;
    const bar = (await page.locator('[data-slot="bottom-bar"]').boundingBox())!;
    const fab = (await page.getByRole("button", { name: "Log", exact: true }).boundingBox())!;
    expect(Math.round(navBox.y + navBox.height)).toBe(viewport.height);
    expect(Math.abs(bar.y + bar.height - navBox.y)).toBeLessThan(1.5);
    expect(fab.y + fab.height).toBeLessThanOrEqual(bar.y - 8);
    // Each place is a target a thumb can hit.
    const item = (await nav(page).getByRole("button", { name: "Today" }).boundingBox())!;
    expect(item.height).toBeGreaterThanOrEqual(48);
    const height = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--cennge-bottom-nav"));
    expect(parseFloat(height)).toBeCloseTo(navBox.height, 0);
  });
});

test.describe("FloatingActionButton and BottomBar", () => {
  test("the floating button is named by its label and opens its menu; the bar's action runs", async ({ page }) => {
    await page.getByRole("button", { name: "Log", exact: true }).click();
    await page.getByRole("menuitem", { name: "Deploy" }).click();
    await expect(log(page)).toHaveText("log deploy");
    await page.getByRole("button", { name: "Log set" }).click();
    await expect(log(page)).toHaveText("logged");
  });
});

test.describe("SwipeActions", () => {
  const row = (page: Page, name: string) => page.locator('[data-slot="swipe-actions"]').filter({ hasText: name });

  test("every action is in the menu at the end of the row, for a mouse or a keyboard", async ({ page, isMobile }) => {
    test.skip(isMobile, "the swipes are tested on phones");
    const menu = page.getByRole("button", { name: "Actions for unit, payload-cache" });
    await menu.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menuitem")).toHaveText(["Done", "Copy", "Delete"]);
    await page.getByRole("menuitem", { name: "Copy" }).click();
    await expect(log(page)).toHaveText("copy unit");
    // Closed rows keep their actions out of the tab order.
    await expect(row(page, "unit").locator('[data-slot="swipe-actions-trailing"]')).toHaveAttribute("inert", "");
  });

  test("deleting a row from its menu moves focus to the next row's menu, not to the page", async ({ page, isMobile }) => {
    test.skip(isMobile, "the keyboard path");
    await page.getByRole("button", { name: "Actions for e2e (webkit), cennge-ui" }).focus();
    await page.keyboard.press("Enter");
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await expect(log(page)).toHaveText("delete e2e");
    await expect(page.getByRole("button", { name: "Actions for unit, payload-cache" })).toBeFocused();
  });

  test("a swipe left reveals the trailing actions; one of them runs on a tap", async ({ page, isMobile }) => {
    test.skip(!isMobile, "fingers swipe; a mouse has the menu");
    const unit = row(page, "unit");
    await swipe(unit.locator('[data-slot="swipe-actions-row"]'), -120, 0);
    await expect(unit).toHaveAttribute("data-open", "trailing");
    await expect(unit.locator('[data-slot="swipe-actions-trailing"]')).not.toHaveAttribute("inert");
    await unit.getByRole("button", { name: "Delete" }).tap();
    await expect(log(page)).toHaveText("delete unit");
    await expect(row(page, "unit")).toHaveCount(0);
  });

  test("a full swipe right runs the first leading action; a short one springs back; a scroll is left alone", async ({ page, isMobile }) => {
    test.skip(!isMobile, "fingers swipe; a mouse has the menu");
    const e2e = row(page, "e2e");
    const surface = e2e.locator('[data-slot="swipe-actions-row"]');
    await swipe(surface, 20, 0);
    await expect(e2e).not.toHaveAttribute("data-open");
    await swipe(surface, 6, 60);
    await expect(e2e).not.toHaveAttribute("data-open");
    const width = (await surface.boundingBox())!.width;
    await swipe(surface, width * 0.75, 0);
    await expect(log(page)).toHaveText("done e2e");
  });

  test("a tap on an open row closes it instead of opening the row", async ({ page, isMobile }) => {
    test.skip(!isMobile, "fingers swipe; a mouse has the menu");
    const deploy = row(page, "deploy");
    await swipe(deploy.locator('[data-slot="swipe-actions-row"]'), -120, 0);
    await expect(deploy).toHaveAttribute("data-open", "trailing");
    await deploy.getByRole("button", { name: "deploy preview, ai-niche-scout", exact: true }).tap();
    await expect(deploy).not.toHaveAttribute("data-open");
    await expect(log(page)).not.toHaveText("open deploy");
  });
});

test.describe("Bottom sheet", () => {
  const sheet = (page: Page) => page.getByRole("dialog", { name: "Add a run" });
  const share = async (page: Page) => (await sheet(page).boundingBox())!.height / page.viewportSize()!.height;

  test("opens at its lowest snap point; the handle steps up and back, by click and by arrow keys", async ({ page }) => {
    await page.getByRole("button", { name: "Add a run" }).click();
    await settleAnimations(page);
    expect(await share(page)).toBeCloseTo(0.4, 1);
    await sheet(page).getByRole("button", { name: "Expand" }).click();
    await expect(page.getByTestId("snap")).toHaveText("snap 1");
    await settleAnimations(page);
    expect(await share(page)).toBeCloseTo(0.9, 1);
    const handle = sheet(page).getByRole("button", { name: "Collapse" });
    await handle.focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByTestId("snap")).toHaveText("snap 0");
    await page.keyboard.press("ArrowUp");
    await expect(page.getByTestId("snap")).toHaveText("snap 1");
  });

  test("opening, focus goes to what the sheet holds, not to its handle", async ({ page }) => {
    await page.getByRole("button", { name: "Add a run" }).click();
    await expect(sheet(page).getByRole("button", { name: "Workflow 1", exact: true })).toBeFocused();
  });

  test("a drag held still before it lets go is not a fling: the sheet stays", async ({ page }) => {
    await page.getByRole("button", { name: "Add a run" }).click();
    await settleAnimations(page);
    const grip = sheet(page).locator('[data-slot="drawer-grip"]');
    const box = (await grip.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    const fire = (type: string, py: number) =>
      grip.dispatchEvent(type, { pointerId: 9, pointerType: "touch", isPrimary: true, button: 0, buttons: 1, clientX: x, clientY: py, bubbles: true });
    await fire("pointerdown", y);
    await fire("pointermove", y + 20);
    await fire("pointermove", y + 40);
    await page.waitForTimeout(400);
    await fire("pointerup", y + 40);
    await settleAnimations(page);
    await expect(sheet(page)).toBeVisible();
    expect(await share(page)).toBeCloseTo(0.4, 1);
  });

  test("everything in the sheet scrolls into view at its lowest point", async ({ page }) => {
    await page.getByRole("button", { name: "Add a run" }).click();
    await settleAnimations(page);
    const last = sheet(page).getByText("Workflow 30");
    await last.scrollIntoViewIfNeeded();
    const box = (await last.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  });

  test("dragged up by its handle it settles on the next point; dragged down past the lowest it closes", async ({ page }) => {
    await page.getByRole("button", { name: "Add a run" }).click();
    await settleAnimations(page);
    const grip = sheet(page).locator('[data-slot="drawer-grip"]');
    const height = page.viewportSize()!.height;
    await swipe(grip, 0, -height * 0.4, 12);
    await expect(page.getByTestId("snap")).toHaveText("snap 1");
    await settleAnimations(page);
    await swipe(grip, 0, height * 0.45, 12);
    await expect(page.getByTestId("snap")).toHaveText("snap 0");
    await settleAnimations(page);
    await swipe(grip, 0, height * 0.35, 12);
    await expect(sheet(page)).toBeHidden();
    await expect(page.getByRole("button", { name: "Add a run" })).toBeFocused();
  });

  test("a sheet without snap points closes when dragged down", async ({ page }) => {
    await page.getByRole("button", { name: "Filters" }).click();
    const filters = page.getByRole("dialog", { name: "Filters" });
    await settleAnimations(page);
    await swipe(filters.locator('[data-slot="drawer-grip"]'), 0, 200, 10);
    await expect(filters).toBeHidden();
  });
});

for (const theme of ["dark", "light"] as const) {
  test(`no axe violations in ${theme}, with a sheet open too`, async ({ page }) => {
    await openFixture(page, "mobile-shell", theme);
    await expectAccessible(page);
    await page.getByRole("button", { name: "Add a run" }).click();
    await expectAccessible(page, { modal: true });
  });
}
