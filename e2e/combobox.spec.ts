import { expect, expectAccessible, openFixture, test } from "./test";
import type { Page } from "@playwright/test";

const repo = (page: Page) => page.getByRole("combobox", { name: "Repository" });
const activeOption = (page: Page) =>
  repo(page).evaluate((input) => {
    const id = input.getAttribute("aria-activedescendant");
    return id ? (document.getElementById(id)?.querySelector("span span")?.textContent ?? null) : null;
  });

test.beforeEach(async ({ page }) => {
  await openFixture(page, "combobox");
});

test.describe("Combobox", () => {
  test("typing filters, arrows move the active option, Enter selects and closes", async ({ page }) => {
    await repo(page).click();
    await page.keyboard.type("sc");
    const listbox = page.getByRole("listbox");
    await expect(listbox.getByRole("option")).toHaveCount(3);
    expect(await activeOption(page)).toBe("ai-niche-scout");
    await page.keyboard.press("ArrowDown");
    expect(await activeOption(page)).toBe("spredo-crypto-screener");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("repo")).toHaveText("spredo-crypto-screener");
    await expect(repo(page)).toHaveValue("spredo-crypto-screener");
    await expect(repo(page)).toHaveAttribute("aria-expanded", "false");
    await expect(repo(page)).toBeFocused();
  });

  test("arrow navigation skips disabled options and wraps", async ({ page }) => {
    await repo(page).focus();
    await page.keyboard.press("ArrowDown");
    expect(await activeOption(page)).toBe("cennge-ui");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    expect(await activeOption(page)).toBe("spredo-crypto-screener"); // payload-cache is disabled
    await page.keyboard.press("End");
    expect(await activeOption(page)).toBe("playwright-msi-scraper");
    await page.keyboard.press("ArrowDown");
    expect(await activeOption(page)).toBe("cennge-ui");
  });

  test("Escape closes and restores the text", async ({ page }) => {
    await repo(page).click();
    await page.keyboard.type("zzz");
    await expect(page.getByText("No repository")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(repo(page)).toHaveAttribute("aria-expanded", "false");
    await expect(repo(page)).toHaveValue("");
  });

  test("pointer: open, pick an option, clear", async ({ page, isMobile }) => {
    if (isMobile) await repo(page).tap();
    else await repo(page).click();
    const option = page.getByRole("option", { name: /ai-niche-scout/ });
    if (isMobile) await option.tap();
    else await option.click();
    await expect(page.getByTestId("repo")).toHaveText("ai-niche-scout");
    await page.getByRole("button", { name: "Clear" }).first().click();
    await expect(page.getByTestId("repo")).toHaveText("none");
  });

  test("the list fits on screen and the page never scrolls sideways", async ({ page }) => {
    await repo(page).click();
    const box = await page.getByRole("listbox").boundingBox();
    const viewport = page.viewportSize();
    if (!box || !viewport) throw new Error("no box");
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("multiple: Enter toggles without closing; Backspace removes the last tag", async ({ page }) => {
    const input = page.getByRole("combobox", { name: "Topics" });
    await input.click();
    await page.keyboard.type("type");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("topics")).toHaveText("react|typescript");
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await expect(input).toHaveValue("");
    await page.keyboard.press("Backspace");
    await expect(page.getByTestId("topics")).toHaveText("react");
  });

  test("passes axe with the list open", async ({ page }) => {
    await repo(page).click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await expectAccessible(page);
  });
});

test.describe("Select", () => {
  const trigger = (page: Page) => page.getByRole("combobox", { name: "Language" });

  test("keyboard: open, move, select; typeahead jumps", async ({ page }) => {
    await trigger(page).focus();
    await page.keyboard.press("Enter");
    // Radix moves focus into the list once it is positioned; keys pressed before that are dropped.
    await expect(page.getByRole("option", { name: "TypeScript" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("option", { name: "Python" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("language")).toHaveText("py");
    await expect(trigger(page)).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page.getByRole("option", { name: "Python" })).toBeFocused();
    await page.keyboard.type("j");
    await expect(page.getByRole("option", { name: "Java" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("language")).toHaveText("java");
  });

  test("clear returns to the placeholder", async ({ page, isMobile }) => {
    if (isMobile) await trigger(page).tap();
    else await trigger(page).click();
    await page.getByRole("option", { name: "TypeScript" }).click();
    await expect(trigger(page)).toContainText("TypeScript");
    await page.getByRole("button", { name: "Clear" }).last().click();
    await expect(trigger(page)).toContainText("Pick a language");
    await expect(page.getByTestId("language")).toHaveText("none");
  });

  test("disabled options cannot be chosen", async ({ page }) => {
    await trigger(page).click();
    await expect(page.getByRole("option", { name: "C++" })).toHaveAttribute("aria-disabled", "true");
  });

  test("while open, Tab cannot reach the page behind the list", async ({ page }) => {
    await trigger(page).click();
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();
    for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
    const focusInside = await listbox.evaluate((node) => node.contains(document.activeElement));
    expect(focusInside).toBe(true);
  });

  for (const theme of ["dark", "light"] as const) {
    test(`passes axe with the list open in the ${theme} theme`, async ({ page }) => {
      await openFixture(page, "combobox", theme);
      await trigger(page).click();
      await expect(page.getByRole("listbox")).toBeVisible();
      await expectAccessible(page, { modal: true });
    });
  }
});
