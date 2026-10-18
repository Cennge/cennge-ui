import { expect, expectAccessible, openFixture, test } from "./test";
import type { Page } from "@playwright/test";

const wizard = (page: Page) => page.getByRole("list", { name: "Create repository" });
const next = (page: Page) => page.getByRole("button", { name: "Next" });

test.beforeEach(async ({ page }) => {
  await openFixture(page, "stepper");
});

test("walks through the wizard to the completed content", async ({ page }) => {
  await expect(page.getByText("Step 1 form")).toBeVisible();
  for (const content of ["Step 2 form", "Step 3 form", "Step 4 form", "Repository created"]) {
    await next(page).click();
    await expect(page.getByText(content)).toBeVisible();
  }
  await expect(wizard(page).locator("li[aria-current]")).toHaveCount(0);
});

test("the active step is aria-current and announces its state", async ({ page }) => {
  await next(page).click();
  const steps = wizard(page).getByRole("listitem");
  await expect(steps.nth(1)).toHaveAttribute("aria-current", "step");
  await expect(steps.nth(0)).toContainText("Repository, completed");
  await expect(steps.nth(2)).toContainText("Access, not started");
});

test("only finished steps are buttons; clicking one goes back", async ({ page }) => {
  await next(page).click();
  await next(page).click();
  await expect(wizard(page).getByRole("button")).toHaveCount(2);
  await wizard(page).getByRole("button", { name: /Repository/ }).click();
  await expect(page.getByText("Step 1 form")).toBeVisible();
  await expect(wizard(page).getByRole("listitem").nth(0)).toHaveAttribute("aria-current", "step");
});

test("finished steps work from the keyboard", async ({ page }) => {
  await next(page).click();
  await next(page).click();
  const settings = wizard(page).getByRole("button", { name: /Settings/ });
  await settings.focus();
  await expect(settings).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Step 2 form")).toBeVisible();
});

test("labels sit beside indicators on desktop and under them on narrow screens", async ({ page, isMobile }) => {
  const first = wizard(page).getByRole("listitem").first();
  const indicator = await first.locator('[data-slot="indicator"]').boundingBox();
  const title = await first.locator('[data-slot="title"]').boundingBox();
  if (!indicator || !title) throw new Error("missing boxes");
  if (isMobile) expect(title.y).toBeGreaterThanOrEqual(indicator.y + indicator.height - 1);
  else expect(title.x).toBeGreaterThanOrEqual(indicator.x + indicator.width);
});

test("never scrolls the page sideways", async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("vertical: the active step shows its content and a spinner while loading", async ({ page }) => {
  const deploy = page.getByRole("list", { name: "Deploy" });
  const active = deploy.locator("li[aria-current=step]");
  await expect(active).toContainText("Test, current step");
  await expect(active).toContainText("Running 95 tests…");
  await expect(active.locator("svg.animate-spin")).toHaveCount(1);
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "stepper", theme);
    await expectAccessible(page);
    await next(page).click();
    await next(page).click();
    await expectAccessible(page);
  });
}
