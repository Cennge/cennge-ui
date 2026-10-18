import { expect, expectAccessible, openFixture, test } from "./test";
import type { Page } from "@playwright/test";

const field = (page: Page, name: string) => page.getByRole("spinbutton", { name });
/** The − / + buttons that belong to one field. */
const button = (page: Page, name: string, which: "Increase" | "Decrease") =>
  field(page, name).locator("xpath=..").getByRole("button", { name: which });

test.beforeEach(async ({ page }) => {
  await openFixture(page, "number-input");
});

test("refuses letters while typing and reports numbers", async ({ page }) => {
  const stars = field(page, "Stars");
  await stars.fill("");
  await expect(page.getByTestId("stars-value")).toHaveText("null");
  await stars.pressSequentially("4a2");
  await expect(stars).toHaveValue("42");
  await expect(page.getByTestId("stars-value")).toHaveText("42");
});

test("keyboard: arrows, PageUp/PageDown, Home/End", async ({ page }) => {
  const stars = field(page, "Stars");
  await stars.focus();
  await page.keyboard.press("ArrowUp");
  await expect(stars).toHaveValue("6");
  await page.keyboard.press("PageUp");
  await expect(stars).toHaveValue("16");
  await page.keyboard.press("PageDown");
  await page.keyboard.press("ArrowDown");
  await expect(stars).toHaveValue("5");
  await page.keyboard.press("End");
  await expect(stars).toHaveValue("100");
  await page.keyboard.press("ArrowUp");
  await expect(stars).toHaveValue("100");
  await page.keyboard.press("Home");
  await expect(stars).toHaveValue("0");
  await expect(stars).toHaveAttribute("aria-valuenow", "0");
});

test("clamps and formats when focus leaves", async ({ page }) => {
  const stars = field(page, "Stars");
  await stars.fill("5000");
  await stars.press("Tab");
  await expect(stars).toHaveValue("100");
  await expect(page.getByTestId("stars-value")).toHaveText("100");
});

test("decimal steps have no floating point noise", async ({ page }) => {
  const ratio = field(page, "Ratio");
  await ratio.focus();
  await page.keyboard.press("ArrowUp");
  await expect(ratio).toHaveValue("0.3");
  await page.keyboard.press("ArrowUp");
  await expect(ratio).toHaveValue("0.4");
  await expect(ratio).toHaveAttribute("aria-valuenow", "0.4");
});

test("ru-RU currency: decimal comma in, formatted roubles out", async ({ page }) => {
  const price = field(page, "Цена");
  await expect(price).toHaveValue(/^1\s500,00\s₽$/);
  await price.fill("2499,9");
  await price.press("Tab");
  await expect(price).toHaveValue(/^2\s499,90\s₽$/);
  await expect(price).toHaveAttribute("aria-valuenow", "2499.9");
});

test("buttons step without stealing focus", async ({ page, isMobile }) => {
  const stars = field(page, "Stars");
  await stars.focus();
  const increase = button(page, "Stars", "Increase");
  if (isMobile) await increase.tap();
  else await increase.click();
  await expect(stars).toHaveValue("6");
  await expect(stars).toBeFocused();
});

test("buttons are disabled at the bounds", async ({ page }) => {
  const stars = field(page, "Stars");
  await stars.focus();
  await page.keyboard.press("End");
  await expect(button(page, "Stars", "Increase")).toBeDisabled();
  await expect(button(page, "Stars", "Decrease")).toBeEnabled();
});

test("press and hold repeats, release stops", async ({ page, isMobile }) => {
  test.skip(isMobile, "Playwright cannot hold a touch point; covered on desktop");
  const box = await button(page, "Stars", "Increase").boundingBox();
  if (!box) throw new Error("no button");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(900);
  await page.mouse.up();
  const afterRelease = Number(await field(page, "Stars").inputValue());
  expect(afterRelease).toBeGreaterThanOrEqual(10);
  await page.waitForTimeout(300);
  expect(Number(await field(page, "Stars").inputValue())).toBe(afterRelease);
});

test("forms receive the clamped raw number, even when submitted with Enter", async ({ page }) => {
  const budget = field(page, "Budget");
  await budget.fill("50000");
  await budget.press("Enter");
  await expect(page.getByTestId("submitted")).toHaveText('{"budget":"20000"}');
  await expect(budget).toHaveValue("20,000");
});

test("disabled field cannot be edited or stepped", async ({ page }) => {
  const disabled = field(page, "Disabled");
  await expect(disabled).toBeDisabled();
  await expect(button(page, "Disabled", "Increase")).toBeDisabled();
});

test("mobile keyboards get a decimal keypad when negatives are not allowed", async ({ page }) => {
  await expect(field(page, "Stars")).toHaveAttribute("inputmode", "decimal");
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "number-input", theme);
    await expectAccessible(page);
  });
}
