import { expect, expectAccessible, openFixture, test } from "./test";
import type { Locator, Page } from "@playwright/test";

const group = (page: Page, name: string) => page.getByRole("group", { name });
const slotsOf = (field: Locator) => field.getByRole("textbox");
const valueOf = (field: Locator) =>
  slotsOf(field).evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value).join(""));

test.beforeEach(async ({ page }) => {
  await openFixture(page, "otp-input");
});

test("typing fills the slots in turn, skips letters and reports the complete code", async ({ page }) => {
  const code = group(page, "Verification code");
  await slotsOf(code).first().click();
  await page.keyboard.type("48a1516");
  await expect.poll(() => valueOf(code)).toBe("481516");
  await expect(page.getByTestId("completed")).toHaveText("481516");
});

test("SMS autofill: the whole code arriving in the first slot fills every slot", async ({ page }) => {
  const code = group(page, "Verification code");
  await expect(slotsOf(code).first()).toHaveAttribute("autocomplete", "one-time-code");
  await slotsOf(code).first().focus();
  await page.keyboard.insertText("907214");
  await expect.poll(() => valueOf(code)).toBe("907214");
  await expect(page.getByTestId("completed")).toHaveText("907214");
});

test("pasting a formatted code fills every slot without the separators", async ({ page, browserName }) => {
  test.skip(
    browserName === "firefox",
    "Firefox hides clipboard data from script-created paste events; real pastes are trusted and carry it",
  );
  const code = group(page, "Verification code");
  await slotsOf(code).first().focus();
  await slotsOf(code).first().evaluate((input) => {
    const data = new DataTransfer();
    data.setData("text/plain", "907-214");
    input.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
  });
  await expect.poll(() => valueOf(code)).toBe("907214");
});

test("keyboard: one Tab stop that lands on the next empty slot; arrows and Backspace move back", async ({ page }) => {
  const code = group(page, "Verification code");
  const slots = slotsOf(code);
  await page.getByLabel("Email").focus();
  await page.keyboard.press("Tab");
  await expect(slots.nth(0)).toBeFocused();
  await page.keyboard.type("12");
  await expect(slots.nth(2)).toBeFocused();

  await page.keyboard.press("ArrowLeft");
  await expect(slots.nth(1)).toBeFocused();
  await page.keyboard.press("Backspace");
  await expect.poll(() => valueOf(code)).toBe("1");
  await expect(slots.nth(0)).toBeFocused();

  // Tab leaves the whole field in one step.
  await page.keyboard.press("Tab");
  await expect(code.locator(":focus")).toHaveCount(0);
});

test("Shift+Tab leaves a field in one step and comes back to where typing continues", async ({ page, browserName }) => {
  test.skip(
    browserName === "firefox",
    "Playwright's Firefox runs page microtasks only after it has moved focus, so React has not yet " +
      "taken the group out of the Tab order (keydown → focusout → microtask). Real key presses " +
      "follow the HTML spec, as in Chromium and WebKit: keydown → microtask → focusout.",
  );
  const code = group(page, "Verification code");
  const recovery = group(page, "Recovery code");
  await slotsOf(code).first().click();
  await page.keyboard.type("12");
  await slotsOf(recovery).first().focus();
  await page.keyboard.press("Shift+Tab");
  await expect(slotsOf(code).nth(2)).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByLabel("Email")).toBeFocused();
});

test("a click or tap on a later empty slot starts at the first empty one", async ({ page, isMobile }) => {
  const code = group(page, "Verification code");
  const slots = slotsOf(code);
  if (isMobile) await slots.nth(4).tap();
  else await slots.nth(4).click();
  await expect(slots.nth(0)).toBeFocused();
});

test("clicking the label continues where the code left off", async ({ page }) => {
  const code = group(page, "Verification code");
  await slotsOf(code).first().click();
  await page.keyboard.type("123");
  await page.getByLabel("Email").focus();
  await page.getByText("Verification code", { exact: true }).click();
  await expect(slotsOf(code).nth(3)).toBeFocused();
});

test("autoSubmit sends the form once the code is complete", async ({ page }) => {
  const code = group(page, "Recovery code");
  await slotsOf(code).first().click();
  await page.keyboard.type("ab12cd34");
  await expect(page.getByTestId("submitted")).toHaveText("ab12cd34");
});

test("an invalid code is announced with the error", async ({ page }) => {
  const code = group(page, "Expired code");
  await expect(code).toHaveAccessibleDescription("This code has expired");
  await expect(slotsOf(code).first()).toHaveAttribute("aria-invalid", "true");
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "otp-input", theme);
    await slotsOf(group(page, "Verification code")).first().click();
    await page.keyboard.type("12");
    await expectAccessible(page);
  });
}
