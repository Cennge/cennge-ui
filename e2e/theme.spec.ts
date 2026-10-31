import { expect, expectAccessible, openFixture, test } from "./test";
import type { Locator, Page } from "@playwright/test";

// The fixture calls initTheme(), as an app without server rendering does: from then on the stored choice
// rules <html>, not the fixture page's theme parameter.
const group = (page: Page) => page.getByRole("radiogroup", { name: "Theme" });
const html = (page: Page) => page.locator("html");
const store = (page: Page, theme: string) => page.addInitScript((theme) => localStorage.setItem("cennge-theme", theme), theme);

async function press(locator: Locator, isMobile: boolean) {
  if (isMobile) await locator.tap();
  else await locator.click();
}

test("a choice shows at once, in every switch and hook on the page, and stays after a reload", async ({ page, isMobile }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await openFixture(page, "theme");
  // Nothing stored: as the system says.
  await expect(page.getByTestId("theme")).toHaveText("chosen system, shown light");
  await expect(group(page).getByRole("radio", { name: "System" })).toHaveAttribute("aria-checked", "true");

  await press(group(page).getByRole("radio", { name: "Dark" }), isMobile);
  await expect(html(page)).toHaveClass(/dark/);
  // The other switch, in Russian, follows.
  await expect(page.getByRole("radio", { name: "Тёмная" })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("theme")).toHaveText("chosen dark, shown dark");

  await page.reload();
  await expect(page.getByTestId("fixture-ready")).toBeAttached({ timeout: 30_000 });
  await expect(html(page)).toHaveClass(/dark/);
  await expect(group(page).getByRole("radio", { name: "Dark" })).toHaveAttribute("aria-checked", "true");
});

test("the keyboard: Tab goes to the chosen one, arrows move, Space chooses", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await openFixture(page, "theme");
  await page.keyboard.press("Tab");
  await expect(group(page).getByRole("radio", { name: "System" })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(group(page).getByRole("radio", { name: "Dark" })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(html(page)).toHaveClass(/dark/);
  await expect(page.getByTestId("theme")).toHaveText("chosen dark, shown dark");
});

test("'System' follows the device, also when it changes", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await store(page, "system");
  await openFixture(page, "theme");
  await expect(html(page)).not.toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(html(page)).toHaveClass(/dark/);
  await expect(page.getByTestId("theme")).toHaveText("chosen system, shown dark");
});

test("another tab's choice reaches this one", async ({ page, context }) => {
  await store(page, "light");
  await openFixture(page, "theme");
  await expect(html(page)).not.toHaveClass(/dark/);
  const other = await context.newPage();
  await openFixture(other, "theme");
  await other.getByRole("radiogroup", { name: "Theme" }).getByRole("radio", { name: "Dark" }).click();
  await expect(html(page)).toHaveClass(/dark/);
  await expect(page.getByTestId("theme")).toHaveText("chosen dark, shown dark");
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page }) => {
    await store(page, theme);
    await openFixture(page, "theme");
    await expect(html(page)).toHaveClass(theme === "dark" ? /dark/ : /^(?!.*dark)/);
    await expectAccessible(page);
  });
}
