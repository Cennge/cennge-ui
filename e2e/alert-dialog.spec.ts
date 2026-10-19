import { expect, expectAccessible, openFixture, test } from "./test";
import type { Locator, Page } from "@playwright/test";

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const alertDialog = (page: Page) => page.getByRole("alertdialog");
const focusIsInside = (container: Locator) => container.evaluate((node) => node.contains(document.activeElement));
const confirmField = (page: Page) => page.getByRole("textbox", { name: "Type Cennge/cennge-ui to confirm" });

async function openDelete(page: Page) {
  await button(page, "Delete repository").click();
  await expect(alertDialog(page)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await openFixture(page, "alert-dialog");
});

test("opens with focus on Cancel, keeps focus inside, Escape returns it to the trigger", async ({ page }) => {
  await openDelete(page);
  await expect(alertDialog(page)).toHaveAccessibleName("Delete Cennge/cennge-ui?");
  await expect(alertDialog(page)).toHaveAccessibleDescription("Issues, releases and the wiki will be deleted for good.");
  await expect(button(page, "Cancel")).toBeFocused();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    expect(await focusIsInside(alertDialog(page))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(alertDialog(page)).toBeHidden();
  await expect(button(page, "Delete repository")).toBeFocused();
});

test("a click or tap outside does not close it; Cancel does", async ({ page, isMobile }) => {
  await openDelete(page);
  if (isMobile) await page.touchscreen.tap(5, 5);
  else await page.mouse.click(5, 5);
  await expect(alertDialog(page)).toBeVisible();
  if (isMobile) await button(page, "Cancel").tap();
  else await button(page, "Cancel").click();
  await expect(alertDialog(page)).toBeHidden();
});

test("Delete unlocks after typing the name; the dialog stays busy until the delete finishes", async ({ page, isMobile }) => {
  await openDelete(page);
  const deleteButton = button(page, "Delete");
  await expect(deleteButton).toBeDisabled();
  await confirmField(page).fill("Cennge/cennge-ui");
  await expect(deleteButton).toBeEnabled();
  if (isMobile) await deleteButton.tap();
  else await deleteButton.click();

  await expect(deleteButton).toHaveAttribute("aria-busy", "true");
  await expect(button(page, "Cancel")).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(alertDialog(page)).toBeVisible();

  await page.evaluate(() => window.finishDelete?.(true));
  await expect(alertDialog(page)).toBeHidden();
  await expect(page.getByTestId("log")).toHaveText("deleted");
});

test("from the keyboard: focus stays on Delete while it runs and after it fails", async ({ page }) => {
  await openDelete(page);
  await confirmField(page).fill("Cennge/cennge-ui");
  const deleteButton = button(page, "Delete");
  await deleteButton.focus();
  await page.keyboard.press("Enter");
  await expect(deleteButton).toHaveAttribute("aria-busy", "true");
  await expect(deleteButton).toBeFocused();

  await page.evaluate(() => window.finishDelete?.(false));
  await expect(page.getByTestId("log")).toHaveText("failed");
  await expect(alertDialog(page)).toBeVisible();
  await expect(deleteButton).not.toHaveAttribute("aria-busy");
  await expect(deleteButton).toBeFocused();
  await expect(button(page, "Cancel")).toBeEnabled();

  // Retry succeeds.
  await page.keyboard.press("Enter");
  await page.evaluate(() => window.finishDelete?.(true));
  await expect(alertDialog(page)).toBeHidden();
  await expect(page.getByTestId("log")).toHaveText("failed,deleted");
});

test("a synchronous action runs and closes", async ({ page }) => {
  await button(page, "Sign out").click();
  await expect(alertDialog(page)).toHaveAccessibleName("Sign out of all devices?");
  await button(page, "Sign out everywhere").click();
  await expect(alertDialog(page)).toBeHidden();
  await expect(page.getByTestId("log")).toHaveText("signed-out");
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe while open in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "alert-dialog", theme);
    await openDelete(page);
    await expectAccessible(page, { modal: true });
  });
}
