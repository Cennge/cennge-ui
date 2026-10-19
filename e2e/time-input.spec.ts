import { expect, expectAccessible, openFixture, test } from "./test";
import type { Page } from "@playwright/test";

const start = (page: Page) => page.getByRole("textbox", { name: "Start" });
const call = (page: Page) => page.getByRole("textbox", { name: "Начало созвона" });
const selected = (page: Page, name: string) =>
  page.getByRole("textbox", { name }).evaluate((input: HTMLInputElement) =>
    input.value.slice(input.selectionStart ?? 0, input.selectionEnd ?? 0),
  );

test.beforeEach(async ({ page }) => {
  await openFixture(page, "time-input");
});

test("typing a short form and Tab: the time is shown on the locale's clock", async ({ page }) => {
  await start(page).fill("930p");
  await page.keyboard.press("Tab");
  await expect(start(page)).toHaveValue(/^9:30\sPM$/);
  await call(page).fill("1445");
  await page.keyboard.press("Tab");
  await expect(call(page)).toHaveValue("14:45");
});

test("arrows change the part under the caret and keep it selected; minutes move by step", async ({ page }) => {
  const field = call(page);
  await field.focus();
  await page.keyboard.press("End"); // caret in the minutes
  await page.keyboard.press("ArrowUp");
  await expect(field).toHaveValue("10:15");
  expect(await selected(page, "Начало созвона")).toBe("15");
  await page.keyboard.press("ArrowUp");
  await expect(field).toHaveValue("10:30");
  await page.keyboard.press("Home"); // caret in the hours
  await page.keyboard.press("ArrowDown");
  await expect(field).toHaveValue("09:30");
  expect(await selected(page, "Начало созвона")).toBe("09");
  await page.keyboard.press("ArrowDown");
  await expect(field).toHaveValue("09:00"); // stops at minValue
});

test("AM/PM switches with the arrows; Enter submits HH:mm", async ({ page }) => {
  const field = start(page);
  await field.focus();
  await page.keyboard.press("End"); // caret in "AM"
  await page.keyboard.press("ArrowUp");
  await expect(field).toHaveValue(/^9:00\sPM$/);
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("submitted")).toHaveText("21:00");
});

test("text that is not a time stays, with the reason; Escape restores the time", async ({ page }) => {
  const field = call(page);
  await field.fill("19:00");
  await page.keyboard.press("Tab");
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await expect(field).toHaveAccessibleDescription("Choose a time from 09:00 to 18:00");
  await field.press("Escape");
  await expect(field).toHaveValue("10:00");
});

test("phones get the number pad on a 24-hour clock and letters where AM/PM is needed", async ({ page }) => {
  await expect(call(page)).toHaveAttribute("inputmode", "numeric");
  await expect(start(page)).toHaveAttribute("inputmode", "text");
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "time-input", theme);
    await call(page).fill("25:00");
    await page.keyboard.press("Tab");
    await expectAccessible(page);
  });
}
