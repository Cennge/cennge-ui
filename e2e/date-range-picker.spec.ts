import { expect, expectAccessible, openFixture, test } from "./test";
import type { Locator, Page } from "@playwright/test";

const vacation = (page: Page) => page.getByRole("group", { name: "Vacation" });
const startOf = (group: Locator) => group.getByRole("textbox", { name: "Start date" });
const endOf = (group: Locator) => group.getByRole("textbox", { name: "End date" });
const popup = (page: Page) => page.getByRole("dialog", { name: "Choose dates" });

test.beforeEach(async ({ page }) => {
  await openFixture(page, "date-range-picker");
});

test("typing both ends and Enter submits the two ISO dates", async ({ page }) => {
  const group = vacation(page);
  await startOf(group).fill("11/02/2026");
  await page.keyboard.press("Tab");
  await endOf(group).fill("11062026");
  await endOf(group).press("Enter");
  await expect(endOf(group)).toHaveValue("11/06/2026");
  await expect(page.getByTestId("submitted")).toHaveText("2026-11-02/2026-11-06");
});

test("an end before the start is refused with the reason", async ({ page }) => {
  const group = vacation(page);
  await endOf(group).fill("10/20/2026");
  await page.keyboard.press("Tab");
  await expect(endOf(group)).toHaveAttribute("aria-invalid", "true");
  await expect(group).toHaveAccessibleDescription("The end date is before the start date");
});

test("keyboard: Enter on the start, arrows, Enter on the end; focus returns to the button", async ({ page }) => {
  const button = vacation(page).getByRole("button", { name: "Choose dates" });
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(popup(page)).toBeVisible();
  await expect(popup(page).getByRole("button", { name: "Monday, October 26, 2026" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(popup(page)).toBeHidden();
  await expect(startOf(vacation(page))).toHaveValue("11/02/2026");
  await expect(endOf(vacation(page))).toHaveValue("11/04/2026");
  await expect(button).toBeFocused();
});

test("Escape first drops a half-chosen range, then closes the calendar", async ({ page }) => {
  await vacation(page).getByRole("button", { name: "Choose dates" }).click();
  await page.keyboard.press("Enter"); // start on the focused day
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Escape");
  await expect(popup(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(popup(page)).toBeHidden();
  await expect(startOf(vacation(page))).toHaveValue("10/26/2026");
});

test("two clicks or taps pick a range; on a phone the months stack and fit the screen", async ({ page, isMobile }) => {
  const tap = (locator: Locator) => (isMobile ? locator.tap() : locator.click());
  await tap(vacation(page).getByRole("button", { name: "Choose dates" }));
  await expect(popup(page)).toBeVisible();
  const grids = popup(page).getByRole("grid");
  await expect(grids).toHaveCount(2);
  if (isMobile) {
    const [first, second] = [await grids.nth(0).boundingBox(), await grids.nth(1).boundingBox()];
    expect(second?.y ?? 0).toBeGreaterThan((first?.y ?? 0) + (first?.height ?? 0) - 1);
  }
  const box = await popup(page).boundingBox();
  const viewport = page.viewportSize();
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewport?.width ?? 0);

  await tap(popup(page).getByRole("button", { name: "Tuesday, November 3, 2026" }));
  const end = popup(page).getByRole("button", { name: "Saturday, November 7, 2026" });
  await end.scrollIntoViewIfNeeded();
  await tap(end);
  await expect(popup(page)).toBeHidden();
  await expect(endOf(vacation(page))).toHaveValue("11/07/2026");
});

test("Russian: day-month-year in both fields", async ({ page }) => {
  const sprint = page.getByRole("group", { name: "Спринт" });
  await startOf(sprint).fill("02.11.2026");
  await endOf(sprint).fill("13.11.2026");
  await page.keyboard.press("Tab");
  await expect(startOf(sprint)).toHaveValue("02.11.2026");
  await expect(sprint).not.toHaveAttribute("aria-invalid");
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme, with the calendar open mid-choice`, async ({ page }) => {
    await openFixture(page, "date-range-picker", theme);
    await expectAccessible(page);
    await vacation(page).getByRole("button", { name: "Choose dates" }).click();
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowRight");
    await expectAccessible(page);
  });
}
