import { expect, expectAccessible, openFixture, test } from "./test";
import type { Locator, Page } from "@playwright/test";

const menu = (page: Page, name: string) => page.getByRole("navigation", { name });
const trigger = (nav: Locator, name: string) => nav.getByRole("button", { name });
/** The open panel's box: the element Radix sizes to the content. */
const panel = (nav: Locator) => nav.locator('[data-state="open"][style*="--radix-navigation-menu-viewport-width"]');

async function centreX(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("no box");
  return box.x + box.width / 2;
}

/** Click on a phone is a tap. */
async function press(locator: Locator, isMobile: boolean) {
  if (isMobile) await locator.tap();
  else await locator.click();
}

test.beforeEach(async ({ page }) => {
  await openFixture(page, "navigation-menu");
});

test("a named navigation landmark; the current page is marked", async ({ page }) => {
  const nav = menu(page, "Main");
  await expect(nav.getByRole("link", { name: "Changelog" })).toHaveAttribute("aria-current", "page");
  await expect(trigger(nav, "Components")).toHaveAttribute("aria-expanded", "false");
});

test("hover opens the panel under its trigger; moving on moves the panel", async ({ page, isMobile }) => {
  test.skip(isMobile, "no hover on touch screens");
  const nav = menu(page, "Main");
  await trigger(nav, "Components").hover();
  await expect(nav.getByRole("link", { name: /Carousel/ })).toBeVisible();
  // The panel is placed once Radix has sized it; give a busy engine time.
  await expect
    .poll(async () => Math.abs((await centreX(panel(nav))) - (await centreX(trigger(nav, "Components")))), { timeout: 10_000 })
    .toBeLessThan(2);
  await trigger(nav, "Repositories").hover();
  await expect(nav.getByRole("link", { name: /ai-niche-scout/ })).toBeVisible();
  await expect
    .poll(async () => Math.abs((await centreX(panel(nav))) - (await centreX(trigger(nav, "Repositories")))), { timeout: 10_000 })
    .toBeLessThan(2);
});

test("mouse with hover opening: a click opens, a click on the open trigger keeps it open", async ({ page, isMobile }) => {
  test.skip(isMobile, "no mouse on touch screens");
  const nav = menu(page, "Main");
  await trigger(nav, "Components").hover();
  await expect(trigger(nav, "Components")).toHaveAttribute("aria-expanded", "true");
  await trigger(nav, "Repositories").hover(); // switches at once while a panel is open
  await trigger(nav, "Repositories").click(); // Radix would toggle it shut
  await trigger(nav, "Repositories").click();
  await page.waitForTimeout(500); // nothing pending reopens or closes it
  await expect(trigger(nav, "Repositories")).toHaveAttribute("aria-expanded", "true");
  // Escape or a click elsewhere closes it.
  await page.keyboard.press("Escape");
  await expect(trigger(nav, "Repositories")).toHaveAttribute("aria-expanded", "false");
});

test("an open panel keeps its size: it does not shrink frame by frame", async ({ page, isMobile }) => {
  const nav = menu(page, "Main");
  await press(trigger(nav, "Components"), isMobile);
  await expect(nav.getByRole("link", { name: /Carousel/ })).toBeVisible();
  await page.waitForTimeout(300);
  const before = await panel(nav).boundingBox();
  await page.waitForTimeout(1500);
  const after = await panel(nav).boundingBox();
  if (!before || !after) throw new Error("no panel");
  expect(Math.abs(after.width - before.width)).toBeLessThan(1);
  expect(Math.abs(after.height - before.height)).toBeLessThan(1);
  // As wide as its content: every link fits, none is cut.
  const link = await nav.getByRole("link", { name: /ScrollArea/ }).boundingBox();
  if (!link) throw new Error("no link");
  expect(link.x + link.width).toBeLessThanOrEqual(after.x + after.width + 0.5);
});

test("a tap, Enter or a click in click mode toggles a panel", async ({ page, isMobile }) => {
  if (isMobile) {
    const nav = menu(page, "Main");
    await trigger(nav, "Repositories").tap();
    await expect(trigger(nav, "Repositories")).toHaveAttribute("aria-expanded", "true");
    await trigger(nav, "Repositories").tap();
    await expect(trigger(nav, "Repositories")).toHaveAttribute("aria-expanded", "false");
    return;
  }
  const main = menu(page, "Main");
  await trigger(main, "Repositories").focus();
  await page.keyboard.press("Enter");
  await expect(trigger(main, "Repositories")).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Enter");
  await expect(trigger(main, "Repositories")).toHaveAttribute("aria-expanded", "false");
  const clicks = menu(page, "Click menu");
  await trigger(clicks, "Repositories").click();
  await expect(trigger(clicks, "Repositories")).toHaveAttribute("aria-expanded", "true");
  await trigger(clicks, "Repositories").click();
  await page.waitForTimeout(400);
  await expect(trigger(clicks, "Repositories")).toHaveAttribute("aria-expanded", "false");
});

test("the panel stays inside the window, also from a trigger at the right edge", async ({ page, isMobile }) => {
  const nav = menu(page, "Right edge");
  await press(trigger(nav, "Components"), isMobile);
  const box = await panel(nav).boundingBox();
  const width = await page.evaluate(() => window.innerWidth);
  if (!box) throw new Error("no panel");
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(width);
});

test("keyboard: Enter opens, ArrowDown goes in, Escape closes back to the trigger", async ({ page }) => {
  const nav = menu(page, "Main");
  await page.getByRole("button", { name: "Before" }).focus();
  await page.keyboard.press("Tab");
  await expect(trigger(nav, "Components")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(trigger(nav, "Components")).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("ArrowDown");
  await expect(nav.getByRole("link", { name: /Carousel/ })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(nav.getByRole("link", { name: /Rating/ })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger(nav, "Components")).toBeFocused();
  await expect(trigger(nav, "Components")).toHaveAttribute("aria-expanded", "false");
  // Arrows move along the bar.
  await page.keyboard.press("ArrowRight");
  await expect(trigger(nav, "Repositories")).toBeFocused();
});

test("openOn=\"click\": resting the pointer does nothing, a click opens, a click outside closes", async ({ page, isMobile }) => {
  const nav = menu(page, "Click menu");
  if (!isMobile) {
    await trigger(nav, "Components").hover();
    await page.waitForTimeout(500);
    await expect(trigger(nav, "Components")).toHaveAttribute("aria-expanded", "false");
  }
  await press(trigger(nav, "Components"), isMobile);
  await expect(nav.getByRole("link", { name: /Carousel/ })).toBeVisible();
  if (!isMobile) {
    // Leaving the panel with the pointer keeps it open.
    await page.getByRole("button", { name: "After" }).hover();
    await page.waitForTimeout(500);
    await expect(trigger(nav, "Components")).toHaveAttribute("aria-expanded", "true");
  }
  await press(page.getByRole("button", { name: "Before" }), isMobile);
  await expect(trigger(nav, "Components")).toHaveAttribute("aria-expanded", "false");
});

test("vertical: the panel opens beside its trigger, and on a phone stays on the screen", async ({ page, isMobile }) => {
  const nav = menu(page, "Docs");
  await press(trigger(nav, "Repositories"), isMobile);
  const [panelBox, triggerBox] = [await panel(nav).boundingBox(), await trigger(nav, "Repositories").boundingBox()];
  if (!panelBox || !triggerBox) throw new Error("no box");
  expect(Math.abs(panelBox.y - triggerBox.y)).toBeLessThan(2);
  if (!isMobile) expect(panelBox.x).toBeGreaterThanOrEqual(triggerBox.x + triggerBox.width - 1);
  // The wide panel does not fit beside the list on a phone: it moves left instead of off the screen.
  await press(trigger(nav, "Components"), isMobile);
  const wide = await panel(nav).boundingBox();
  const width = await page.evaluate(() => window.innerWidth);
  if (!wide) throw new Error("no panel");
  expect(wide.x).toBeGreaterThanOrEqual(0);
  expect(wide.x + wide.width).toBeLessThanOrEqual(width);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    .toBe(true);
});

test("keepMounted: closed panels' links are in the page, hidden", async ({ page }) => {
  const nav = menu(page, "Crawlable");
  const links = nav.locator('a[href="#form"]');
  await expect(links).toHaveCount(1);
  await expect(links).toBeHidden();
  // The other menus render a panel only while it is open.
  await expect(menu(page, "Main").locator('a[href="#form"]')).toHaveCount(0);
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe with a panel open in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "navigation-menu", theme);
    await trigger(menu(page, "Main"), "Components").click();
    await expect(menu(page, "Main").getByRole("link", { name: /Carousel/ })).toBeVisible();
    // Radix renders a hidden focus proxy (aria-hidden, tabindex 0) after an open trigger: Tab lands on it
    // and it moves focus into the panel at once. It is part of the primitive, so axe skips that one span.
    await expectAccessible(page, { exclude: ['nav span[aria-hidden="true"][tabindex="0"]'] });
  });
}
