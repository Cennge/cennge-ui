import { expect, expectAccessible, openFixture, settleAnimations, test } from "./test";
import type { Page } from "@playwright/test";

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
// Radix also renders a visually hidden announcer with role="status"; target the visible toasts.
const toasts = (page: Page) => page.locator('[data-slot="toast"]');
const toastWith = (page: Page, text: string) => toasts(page).filter({ hasText: text });

test.beforeEach(async ({ page }) => {
  await openFixture(page, "toast");
});

test("appears with title and description, then closes by itself", async ({ page }) => {
  await button(page, "Short toast").click();
  const toast = toastWith(page, "Deployed");
  await expect(toast).toBeVisible();
  await expect(toast).toContainText("v0.2.0 is live");
  await expect(toast).toBeHidden({ timeout: 4000 });
});

test("hovering pauses the auto-close timer", async ({ page, isMobile }) => {
  test.skip(isMobile, "No hover on touch");
  await button(page, "Short toast").click();
  const toast = toastWith(page, "Deployed");
  await toast.hover();
  await page.waitForTimeout(2500); // longer than the 1.5 s duration
  await expect(toast).toBeVisible();
  await page.mouse.move(5, 5, { steps: 5 });
  await expect(toast).toBeHidden({ timeout: 4000 });
});

test("the action runs and closes the toast; the close button closes it", async ({ page }) => {
  await button(page, "Toast with action").click();
  await page.getByRole("button", { name: "Renew" }).click();
  await expect(page.getByTestId("log")).toHaveText("renew");
  await expect(toastWith(page, "Token expires soon")).toBeHidden();

  await button(page, "Sticky toast").click();
  const sticky = toastWith(page, "Branch is behind");
  await sticky.getByRole("button", { name: "Close" }).click();
  await expect(sticky).toBeHidden();
});

test("a promise toast changes from loading to the result in place", async ({ page }) => {
  await button(page, "Promise toast").click();
  await expect(toastWith(page, "Pushing…")).toBeVisible();
  await page.evaluate(() => window.settleToast?.());
  await expect(toastWith(page, "Pushed")).toBeVisible();
  await expect(toasts(page).filter({ hasText: /Pushing|Pushed/ })).toHaveCount(1);
});

test("F8 moves keyboard focus to the notifications", async ({ page }) => {
  await button(page, "Sticky toast").click();
  await expect(toastWith(page, "Branch is behind")).toBeVisible();
  await page.keyboard.press("F8");
  const region = page.getByRole("region", { name: /Notifications/ });
  const focusInside = await region.evaluate((node) => node.contains(document.activeElement));
  expect(focusInside).toBe(true);
});

test("swiping a toast away dismisses it", async ({ page, isMobile }) => {
  test.skip(isMobile, "Playwright cannot drag a touch point; the swipe uses the same pointer events");
  await button(page, "Sticky toast").click();
  const toast = toastWith(page, "Branch is behind");
  const box = await toast.boundingBox();
  if (!box) throw new Error("no toast");
  await page.mouse.move(box.x + 20, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 220, box.y + box.height / 2, { steps: 12 });
  await page.mouse.up();
  await expect(toast).toBeHidden();
});

test("stays inside the screen, with equal side margins on phones", async ({ page, isMobile }) => {
  await button(page, "Toast with action").click();
  const toast = toastWith(page, "Token expires soon");
  await expect(toast).toBeVisible();
  await settleAnimations(page);
  const box = await toast.boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) throw new Error("no box");
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  if (isMobile) {
    const left = box.x;
    const right = viewport.width - (box.x + box.width);
    expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
  }
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe with toasts on screen in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "toast", theme);
    await button(page, "Toast with action").click();
    await button(page, "Sticky toast").click();
    await expect(toasts(page)).toHaveCount(2);
    await expectAccessible(page);
  });
}
