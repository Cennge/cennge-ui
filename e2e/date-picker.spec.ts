import { expect, expectAccessible, openFixture, test } from "./test";
import type { Page } from "@playwright/test";

const release = (page: Page) => page.getByRole("textbox", { name: "Release" });
const chooseButton = (page: Page, index = 0) => page.getByRole("button", { name: "Choose date" }).nth(index);
const popup = (page: Page) => page.getByRole("dialog", { name: "Choose date" });

test.beforeEach(async ({ page }) => {
  await openFixture(page, "date-picker");
});

test("typing: any separators or none; Tab tidies the text, Enter submits the ISO date", async ({ page }) => {
  const field = release(page);
  await field.fill("");
  await field.pressSequentially("11252026");
  await page.keyboard.press("Tab");
  await expect(field).toHaveValue("11/25/2026");
  await field.fill("12.1.26");
  await field.press("Enter");
  await expect(field).toHaveValue("12/01/2026");
  await expect(page.getByTestId("submitted")).toHaveText("2026-12-01");
});

test("a typed date that does not exist stays, with the reason under the field", async ({ page }) => {
  const field = release(page);
  await field.fill("02/30/2026");
  await page.keyboard.press("Tab");
  await expect(field).toHaveValue("02/30/2026");
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await expect(field).toHaveAccessibleDescription("Enter a date as MM/DD/YYYY");
  await field.press("Escape");
  await expect(field).toHaveValue("10/19/2026");
  await expect(field).not.toHaveAttribute("aria-invalid");
});

test("keyboard: the calendar opens on the selected day; Enter picks, closes and returns focus", async ({ page }) => {
  await chooseButton(page).focus();
  await page.keyboard.press("Enter");
  await expect(popup(page)).toBeVisible();
  await expect(popup(page).getByRole("button", { name: "Monday, October 19, 2026" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(popup(page)).toBeHidden();
  await expect(release(page)).toHaveValue("10/27/2026");
  await expect(chooseButton(page)).toBeFocused();
});

test("the first Escape closes the year grid, the second the calendar", async ({ page }) => {
  await chooseButton(page).click();
  await popup(page).getByRole("button", { name: "Year: 2026" }).click();
  await expect(popup(page).getByRole("grid", { name: "Year" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(popup(page).getByRole("grid", { name: "Year" })).toBeHidden();
  await expect(popup(page)).toHaveAttribute("data-state", "open");
  await page.keyboard.press("Escape");
  await expect(popup(page)).toBeHidden();
});

test("Escape closes the calendar without a change; Alt+ArrowDown in the field opens it", async ({ page }) => {
  await release(page).focus();
  await page.keyboard.press("Alt+ArrowDown");
  await expect(popup(page)).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Escape");
  await expect(popup(page)).toBeHidden();
  await expect(release(page)).toHaveValue("10/19/2026");
});

test("click or tap: open, jump to another year, pick a day; a click outside closes", async ({ page, isMobile }) => {
  const tap = async (locator: ReturnType<Page["locator"]>) => (isMobile ? locator.tap() : locator.click());
  await tap(chooseButton(page));
  await tap(popup(page).getByRole("button", { name: "Year: 2026" }));
  await tap(popup(page).getByRole("grid", { name: "Year" }).getByRole("button", { name: "1990" }));
  await tap(popup(page).getByRole("button", { name: "Friday, October 19, 1990" }));
  await expect(popup(page)).toBeHidden();
  await expect(release(page)).toHaveValue("10/19/1990");

  await tap(chooseButton(page));
  await expect(popup(page)).toBeVisible();
  if (isMobile) await page.touchscreen.tap(5, 600);
  else await page.mouse.click(5, 600);
  await expect(popup(page)).toBeHidden();
});

test("the calendar opens under the field, from its left edge, inside the screen", async ({ page }) => {
  const wrapper = release(page).locator("xpath=..");
  await chooseButton(page).click();
  await expect(popup(page)).toBeVisible();
  const field = await wrapper.boundingBox();
  const box = await popup(page).boundingBox();
  const viewport = page.viewportSize();
  if (!field || !box || !viewport) throw new Error("no box");
  expect(box.y).toBeGreaterThan(field.y + field.height);
  expect(Math.abs(box.x - field.x)).toBeLessThanOrEqual(8);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
});

test("Russian: day-month-year order and a birth date in the past only", async ({ page }) => {
  const birthday = page.getByRole("textbox", { name: "Дата рождения" });
  await expect(birthday).toHaveAttribute("placeholder", "DD.MM.YYYY");
  await birthday.fill("07.03.1994");
  await page.keyboard.press("Tab");
  await expect(birthday).toHaveValue("07.03.1994");
  await birthday.fill("01.01.2030");
  await page.keyboard.press("Tab");
  await expect(birthday).toHaveAccessibleDescription("Choose a date until 19.10.2026");
});

// One axe run per test: two in a row overran the timeout in WebKit during a full parallel run.
for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "date-picker", theme);
    await expectAccessible(page);
  });

  test(`passes axe in the ${theme} theme, with the calendar open`, async ({ page }) => {
    await openFixture(page, "date-picker", theme);
    await chooseButton(page).click();
    await expect(popup(page)).toBeVisible();
    await expectAccessible(page);
  });
}
