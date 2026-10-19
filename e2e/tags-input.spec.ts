import { expect, expectAccessible, openFixture, test } from "./test";
import type { Locator, Page } from "@playwright/test";

const topics = (page: Page) => page.getByRole("textbox", { name: "Topics" });
const topicsValue = (page: Page) => page.getByTestId("topics");
const removeButton = (page: Page, tag: string) => page.getByRole("button", { name: `Remove ${tag}` });

test.beforeEach(async ({ page }) => {
  await openFixture(page, "tags-input");
});

test("typing with Enter and comma creates tags", async ({ page }) => {
  await topics(page).click();
  await page.keyboard.type("tailwindcss,");
  await page.keyboard.type("radix-ui");
  await page.keyboard.press("Enter");
  await expect(topicsValue(page)).toHaveText("react|tailwindcss|radix-ui");
  await expect(topics(page)).toHaveValue("");
});

test("a duplicate is refused, keeps the text and briefly flags the existing tag", async ({ page }) => {
  await topics(page).fill("React");
  await topics(page).press("Enter");
  await expect(topicsValue(page)).toHaveText("react");
  await expect(topics(page)).toHaveValue("React");
  const existing = page.locator('[data-slot="tag"]', { hasText: "react" }).first();
  await expect(existing).toHaveAttribute("data-highlighted", "true");
  await expect(existing).not.toHaveAttribute("data-highlighted", /.*/, { timeout: 2000 });
  await expect(page.locator('[aria-live="polite"]').first()).toHaveText("React is already added");
});

test("Cyrillic and other scripts become tags", async ({ page }) => {
  await topics(page).click();
  await page.keyboard.type("привет");
  await page.keyboard.press("Enter");
  await page.keyboard.type("東京,");
  await page.keyboard.type("café");
  await page.keyboard.press("Enter");
  await expect(topicsValue(page)).toHaveText("react|привет|東京|café");
  await expect(topics(page)).toHaveValue("");
});

test("a refused tag says why under the field until the text is edited", async ({ page }) => {
  const labels = page.getByRole("textbox", { name: "Labels" });
  const label = page.locator("label", { hasText: /^Labels$/ });
  const colorOf = (locator: Locator) => locator.evaluate((node) => getComputedStyle(node).color);
  const normalColor = await colorOf(label);

  await labels.fill("привет");
  await labels.press("Enter");
  await expect(labels).toHaveValue("привет");
  await expect(labels).toHaveAttribute("aria-invalid", "true");
  await expect(labels).toHaveAccessibleDescription("привет is not allowed");

  // Shown on the page, not only to screen readers, and the field turns to the danger colour.
  const reason = page.locator(`[id="${await labels.getAttribute("aria-describedby")}"]`);
  await expect(reason).toHaveText("привет is not allowed");
  expect((await reason.boundingBox())?.height ?? 0).toBeGreaterThan(10);
  const dangerColor = await colorOf(reason);
  expect(dangerColor).not.toBe(normalColor);
  await expect.poll(() => colorOf(label)).toBe(dangerColor);

  await labels.press("Backspace");
  await expect(labels).not.toHaveAttribute("aria-invalid");
  await expect(labels).toHaveAccessibleDescription("Lowercase, up to 3");
  await expect.poll(() => colorOf(label)).toBe(normalColor);
});

test("Backspace in an empty field removes the last tag", async ({ page }) => {
  await topics(page).click();
  await page.keyboard.press("Backspace");
  await expect(topicsValue(page)).toHaveText("");
});

test("pasting a list splits it into tags", async ({ page, browserName }) => {
  test.skip(
    browserName === "firefox",
    "Firefox hides clipboard data from script-created paste events; real pastes are trusted and carry it",
  );
  await topics(page).focus();
  await topics(page).evaluate((input) => {
    const data = new DataTransfer();
    data.setData("text/plain", "vue, svelte\nsolid");
    input.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
  });
  await expect(topicsValue(page)).toHaveText("react|vue|svelte|solid");
});

test("text inserted without key events is split into tags (Android keyboards, autofill)", async ({ page }) => {
  await topics(page).focus();
  await page.keyboard.insertText("vue, svelte, so");
  await expect(topicsValue(page)).toHaveText("react|vue|svelte");
  await expect(topics(page)).toHaveValue("so");
});

test("keyboard: one tab stop; arrows walk the tags; Delete removes and keeps focus nearby", async ({ page }) => {
  await topics(page).fill("vue");
  await topics(page).press("Enter");
  await topics(page).fill("svelte");
  await topics(page).press("Enter");

  // Tab leaves the field instead of stepping through the remove buttons.
  await topics(page).focus();
  await page.keyboard.press("Tab");
  await expect(topics(page)).not.toBeFocused();
  await expect(removeButton(page, "svelte")).not.toBeFocused();

  await topics(page).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(removeButton(page, "svelte")).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(removeButton(page, "vue")).toBeFocused();
  await page.keyboard.press("Delete");
  await expect(topicsValue(page)).toHaveText("react|svelte");
  await expect(removeButton(page, "svelte")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(topics(page)).toBeFocused();
});

test("clicking or tapping a remove button removes the tag and returns focus to the field", async ({ page, isMobile }) => {
  if (isMobile) await removeButton(page, "react").tap();
  else await removeButton(page, "react").click();
  await expect(topicsValue(page)).toHaveText("");
  await expect(topics(page)).toBeFocused();
});

test("forms: Enter with text adds a tag, Enter in an empty field submits", async ({ page }) => {
  const labels = page.getByRole("textbox", { name: "Labels" });
  await labels.fill("Not Valid");
  await labels.press("Enter");
  await expect(page.getByTestId("submitted")).toHaveText("");
  await expect(labels).toHaveValue("Not Valid"); // refused by validate: the text stays to be fixed
  await labels.fill("good-first-issue");
  await labels.press("Enter");
  await expect(page.getByTestId("submitted")).toHaveText("");
  await expect(labels).toHaveValue("");
  await labels.press("Enter");
  await expect(page.getByTestId("submitted")).toHaveText('["bug","good-first-issue"]');
});

test("clear removes every tag", async ({ page }) => {
  await page.getByRole("button", { name: "Clear" }).click();
  await expect(topicsValue(page)).toHaveText("");
  await expect(topics(page)).toBeFocused();
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme, with a refused tag on screen`, async ({ page }) => {
    await openFixture(page, "tags-input", theme);
    await expectAccessible(page);
    const labels = page.getByRole("textbox", { name: "Labels" });
    await labels.fill("Not Valid");
    await labels.press("Enter");
    await expect(labels).toHaveAttribute("aria-invalid", "true");
    await expectAccessible(page);
  });
}
