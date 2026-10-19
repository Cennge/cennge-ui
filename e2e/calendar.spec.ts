import { expect, expectAccessible, openFixture, test } from "./test";
import type { Page } from "@playwright/test";

const release = (page: Page) => page.getByRole("group", { name: "Release date" });
const meeting = (page: Page) => page.getByRole("group", { name: "Meeting" });
const value = (page: Page) => page.getByTestId("value");

test.beforeEach(async ({ page }) => {
  await openFixture(page, "calendar");
});

test("keyboard: Tab lands on the selected day; arrows, Page keys and Enter pick a date", async ({ page }) => {
  const calendar = release(page);
  await calendar.getByRole("button", { name: "Next month" }).focus();
  await page.keyboard.press("Tab");
  await expect(calendar.getByRole("button", { name: "Monday, October 19, 2026" })).toBeFocused();

  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await expect(calendar.getByRole("button", { name: "Tuesday, October 27, 2026" })).toBeFocused();
  await page.keyboard.press("PageDown");
  await expect(calendar.getByRole("grid")).toHaveAccessibleName("November 2026");
  await expect(calendar.getByRole("button", { name: "Friday, November 27, 2026" })).toBeFocused();
  await page.keyboard.press("Shift+PageDown");
  await expect(calendar.getByRole("button", { name: "Saturday, November 27, 2027" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(value(page)).toHaveText("2027-11-27");

  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Space");
  await expect(value(page)).toHaveText("2027-11-26");
});

test("a click or tap picks a day; a day of the next month opens that month", async ({ page, isMobile }) => {
  const calendar = release(page);
  const pick = async (name: string) => {
    const day = calendar.getByRole("button", { name });
    if (isMobile) await day.tap();
    else await day.click();
  };
  await pick("Thursday, October 22, 2026");
  await expect(value(page)).toHaveText("2026-10-22");
  await pick("Tuesday, November 3, 2026");
  await expect(value(page)).toHaveText("2026-11-03");
  await expect(calendar.getByRole("grid")).toHaveAccessibleName("November 2026");
});

test("the month and year pickers jump far away, e.g. to a birth year", async ({ page }) => {
  const calendar = release(page);
  await calendar.getByRole("combobox", { name: "Year" }).selectOption("1990");
  await calendar.getByRole("combobox", { name: "Month" }).selectOption("3");
  await expect(calendar.getByRole("grid")).toHaveAccessibleName("March 1990");
  await calendar.getByRole("button", { name: "Monday, March 19, 1990" }).click();
  await expect(value(page)).toHaveText("1990-03-19");
});

test("limits: days outside are disabled, unavailable days cannot be picked, the keyboard stops at the edge", async ({ page }) => {
  const calendar = meeting(page);
  // en-GB long dates differ between ICU versions ("Sunday 4 October" / "Sunday, 4 October"): use the ISO date.
  const day = (iso: string) => calendar.locator(`[data-date="${iso}"]:not([data-outside])`);
  await expect(calendar.locator('[data-date="2026-10-04"]')).toBeDisabled();
  const weekend = day("2026-10-24");
  await expect(weekend).toHaveAttribute("aria-disabled", "true");
  await weekend.click({ force: true }); // aria-disabled: a user can still click it, and nothing happens
  await expect(weekend.locator("xpath=..")).not.toHaveAttribute("aria-selected");

  await day("2026-10-21").focus();
  await page.keyboard.press("PageDown");
  await page.keyboard.press("PageDown");
  await expect(day("2026-11-20")).toBeFocused();
  await expect(calendar.getByRole("button", { name: "Next month" })).toBeDisabled();
});

test("every month keeps six rows, so the calendar never changes height", async ({ page }) => {
  const calendar = release(page);
  const heights = new Set<number>();
  for (let i = 0; i < 12; i++) {
    const box = await calendar.boundingBox();
    heights.add(Math.round(box?.height ?? 0));
    await calendar.getByRole("button", { name: "Next month" }).click();
  }
  expect([...heights]).toHaveLength(1);
});

test.describe("RangeCalendar", () => {
  const vacation = (page: Page) => page.getByRole("group", { name: "Vacation" });
  const range = (page: Page) => page.getByTestId("range");

  test("two clicks or taps pick a range; the band follows the pointer in between", async ({ page, isMobile }) => {
    const calendar = vacation(page);
    const pick = async (name: string) => {
      const day = calendar.getByRole("button", { name });
      if (isMobile) await day.tap();
      else await day.click();
    };
    await pick("Tuesday, November 10, 2026");
    if (!isMobile) {
      await calendar.getByRole("button", { name: "Friday, November 13, 2026" }).hover();
      await expect(calendar.getByRole("button", { name: "Thursday, November 12, 2026" }).locator("xpath=..")).toHaveAttribute(
        "data-range-middle",
      );
    }
    await pick("Saturday, November 14, 2026");
    await expect(range(page)).toHaveText("2026-11-10/2026-11-14");
  });

  test("keyboard: Enter, arrows, Enter; Escape between them starts over", async ({ page }) => {
    const calendar = vacation(page);
    await calendar.getByRole("button", { name: "Monday, October 26, 2026" }).focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Escape");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(range(page)).toHaveText("2026-11-03/2026-11-05");
  });

  test("the band is continuous: tinted days between round ends", async ({ page }) => {
    const calendar = vacation(page);
    const cellOf = (name: string) => calendar.getByRole("button", { name }).locator("xpath=..");
    const style = (name: string) =>
      cellOf(name).evaluate((cell) => ({ color: getComputedStyle(cell).backgroundColor, image: getComputedStyle(cell).backgroundImage }));
    expect((await style("Wednesday, October 28, 2026")).color).not.toBe("rgba(0, 0, 0, 0)");
    expect((await style("Monday, October 26, 2026")).image).toContain("gradient");
    expect((await style("Wednesday, November 4, 2026")).image).toContain("gradient");
    // Saturday ends the week: rounded band, nothing after it.
    const saturday = await cellOf("Saturday, October 31, 2026").evaluate((cell) => getComputedStyle(cell).borderTopRightRadius);
    expect(saturday).not.toBe("0px");
  });
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "calendar", theme);
    await release(page).getByRole("button", { name: "Thursday, October 22, 2026" }).hover();
    await expectAccessible(page);
  });
}
