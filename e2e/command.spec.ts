import { expect, expectAccessible, openFixture, test } from "./test";
import type { Page } from "@playwright/test";

const palette = (page: Page) => page.getByRole("dialog", { name: "Command palette" });
const search = (page: Page) => palette(page).getByRole("combobox");
const activeText = (page: Page) =>
  search(page).evaluate((input) => document.getElementById(input.getAttribute("aria-activedescendant") ?? "")?.textContent ?? "");

test.beforeEach(async ({ page }) => {
  await openFixture(page, "command");
});

test("Ctrl+K opens the palette with focus in the search; typing filters; Enter runs and closes", async ({ page }) => {
  await page.keyboard.press("Control+k");
  await expect(palette(page)).toBeVisible();
  await expect(search(page)).toBeFocused();
  await page.keyboard.type("startup");
  await expect(palette(page).getByRole("option")).toHaveCount(1);
  await expect(palette(page).getByRole("group", { name: "Actions" })).toBeHidden();
  await page.keyboard.press("Enter");
  await expect(palette(page)).toBeHidden();
  await expect(page.getByTestId("log")).toHaveText("ai-niche-scout");
});

test("arrows skip disabled items and keep the active one in view", async ({ page }) => {
  await page.getByRole("button", { name: "Open command palette" }).click();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  expect(await activeText(page)).toContain("New repository");
  await page.keyboard.press("ArrowDown");
  expect(await activeText(page)).toBe("Settings");
  for (let i = 0; i < 20; i++) await page.keyboard.press("ArrowDown");
  expect(await activeText(page)).toBe("Workflow 20");
  const option = palette(page).getByRole("option", { name: "Workflow 20" });
  await expect(option).toBeInViewport();
  await page.keyboard.press("ArrowDown"); // wraps
  expect(await activeText(page)).toContain("cennge-ui");
});

test("Escape clears the search first, then closes and returns focus", async ({ page }) => {
  const opener = page.getByRole("button", { name: "Open command palette" });
  // From the keyboard: Safari does not focus buttons on click, so there would be nothing to return to.
  await opener.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.type("zzz");
  await expect(palette(page).getByText("No results")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(search(page)).toHaveValue("");
  // data-state, not visibility: a closing dialog stays visible during its exit animation.
  await expect(palette(page)).toHaveAttribute("data-state", "open");
  await page.waitForTimeout(300);
  await expect(palette(page)).toHaveAttribute("data-state", "open");
  await page.keyboard.press("Escape");
  await expect(palette(page)).toBeHidden();
  await expect(opener).toBeFocused();
});

test("opened with the shortcut, it returns focus to where it was", async ({ page }) => {
  const opener = page.getByRole("button", { name: "Open command palette" });
  await opener.focus();
  await page.keyboard.press("Control+k");
  await expect(search(page)).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
});

test("pointer and touch: hovering marks an item, a click or tap runs it", async ({ page, isMobile }) => {
  const opener = page.getByRole("button", { name: "Open command palette" });
  if (isMobile) await opener.tap();
  else await opener.click();
  const settings = palette(page).getByRole("option", { name: "Settings" });
  if (!isMobile) {
    await settings.hover();
    await expect(settings).toHaveAttribute("aria-selected", "true");
  }
  if (isMobile) await settings.tap();
  else await settings.click();
  await expect(page.getByTestId("log")).toHaveText("settings");
  await expect(palette(page)).toBeHidden();
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "command", theme);
    await page.getByRole("button", { name: "Open command palette" }).click();
    await page.keyboard.type("re");
    await expectAccessible(page, { modal: true });
  });
}
