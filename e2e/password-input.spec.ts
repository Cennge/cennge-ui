import { expect, expectAccessible, openFixture, test } from "./test";
import type { Locator, Page } from "@playwright/test";

const password = (page: Page) => page.getByLabel("Password", { exact: true });
const toggleFor = (page: Page, field: Locator) =>
  page.locator("div", { has: field }).last().getByRole("button", { name: "Show password" });

/* Caps Lock cannot be switched on from Playwright; send what the browser sends while it is on. */
async function typeWithCapsLock(field: Locator, on: boolean) {
  await field.evaluate((input, capsLock) => {
    for (const type of ["keydown", "keyup"]) {
      input.dispatchEvent(new KeyboardEvent(type, { key: "A", modifierCapsLock: capsLock, bubbles: true }));
    }
  }, on);
}

test.beforeEach(async ({ page }) => {
  await openFixture(page, "password-input");
});

test("the eye shows the password; after a click or tap the caret stays where it was", async ({ page, isMobile }) => {
  const field = password(page);
  await field.fill("hunter22");
  await field.evaluate((input: HTMLInputElement) => input.setSelectionRange(5, 5));
  const toggle = toggleFor(page, field);
  if (isMobile) await toggle.tap();
  else await toggle.click();

  await expect(field).toHaveAttribute("type", "text");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(field).toBeFocused();
  await expect.poll(() => field.evaluate((input: HTMLInputElement) => input.selectionStart)).toBe(5);
  await page.keyboard.type("X");
  await expect(field).toHaveValue("hunteXr22");

  if (isMobile) await toggle.tap();
  else await toggle.click();
  await expect(field).toHaveAttribute("type", "password");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
});

test("keyboard: Space on the eye toggles it and keeps focus on the button", async ({ page }) => {
  const field = password(page);
  await field.fill("hunter22");
  const toggle = toggleFor(page, field);
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(field).toHaveAttribute("type", "text");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toBeFocused();
});

test("submitting the form hides the password again", async ({ page }) => {
  const field = password(page);
  await field.fill("hunter22");
  await toggleFor(page, field).click();
  await expect(field).toHaveAttribute("type", "text");
  await field.press("Enter");
  await expect(page.getByTestId("submitted")).toHaveText("hunter22");
  await expect(field).toHaveAttribute("type", "password");
});

test("password managers get the right hints, and every id is unique", async ({ page }) => {
  await expect(password(page)).toHaveAttribute("autocomplete", "current-password");
  await expect(page.getByLabel("New password")).toHaveAttribute("autocomplete", "new-password");
  const duplicates = await page.evaluate(() => {
    const ids = Array.from(document.querySelectorAll("[id]"), (node) => node.id);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  });
  expect(duplicates).toEqual([]);
});

test("a hint appears while Caps Lock is on and is read with the field", async ({ page }) => {
  const field = page.getByLabel("New password");
  await field.focus();
  await typeWithCapsLock(field, true);
  await expect(page.getByText("Caps Lock is on")).toBeVisible();
  await expect(field).toHaveAccessibleDescription("Caps Lock is on At least 12 characters");
  await typeWithCapsLock(field, false);
  await expect(page.getByText("Caps Lock is on")).toBeHidden();
  await expect(field).toHaveAccessibleDescription("At least 12 characters");
});

test("a disabled field cannot be revealed", async ({ page }) => {
  const field = page.getByLabel("Disabled");
  await expect(field).toBeDisabled();
  await expect(toggleFor(page, field)).toBeDisabled();
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme, with a password shown and the Caps Lock hint`, async ({ page }) => {
    await openFixture(page, "password-input", theme);
    await password(page).fill("hunter22");
    await toggleFor(page, password(page)).click();
    const newPassword = page.getByLabel("New password");
    await newPassword.focus();
    await typeWithCapsLock(newPassword, true);
    await expect(page.getByText("Caps Lock is on")).toBeVisible();
    await expectAccessible(page);
  });
}
