import { expect, expectAccessible, openFixture, settleAnimations, test } from "./test";
import type { Page } from "@playwright/test";

const column = (page: Page) => page.getByRole("complementary", { name: "Cennge/cennge-ui" });
const drawer = (page: Page) => page.getByRole("dialog", { name: "Cennge/cennge-ui" });

// Each layout skips itself before loading the page: skipped tests should not load anything.
test.describe("desktop", () => {
  test.beforeEach(async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop layout");
    await openFixture(page, "sidebar");
  });

  test("a column with the current page marked; links navigate", async ({ page }) => {
    await expect(column(page)).toBeVisible();
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeHidden();
    await expect(column(page).getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
    await column(page).getByRole("link", { name: "Issues 12" }).click();
    await expect(page.getByTestId("page")).toHaveText("Issues");
    await expect(column(page).getByRole("link", { name: "Issues 12" })).toHaveAttribute("aria-current", "page");
  });

  test("collapses to icons; names stay, tooltips show them; expands again", async ({ page }) => {
    const collapse = page.getByRole("button", { name: "Collapse sidebar" });
    await collapse.click();
    await expect.poll(async () => Math.round((await column(page).boundingBox())?.width ?? 0)).toBe(64);
    const pulls = column(page).getByRole("link", { name: "Pull requests" });
    await expect(pulls).toBeVisible();
    await pulls.hover();
    await expect(page.getByRole("tooltip")).toHaveText("Pull requests");
    await page.getByRole("button", { name: "Expand sidebar" }).click();
    await expect.poll(async () => Math.round((await column(page).boundingBox())?.width ?? 0)).toBe(256);
  });

  test("passes axe expanded", async ({ page }) => {
    await expectAccessible(page);
  });

  test("passes axe collapsed", async ({ page }) => {
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await expectAccessible(page);
  });

  test("passes axe in the light theme", async ({ page }) => {
    await openFixture(page, "sidebar", "light");
    await expectAccessible(page);
  });
});

test.describe("phone", () => {
  test.beforeEach(async ({ page, isMobile }) => {
    test.skip(!isMobile, "Phone layout");
    await openFixture(page, "sidebar");
  });

  test("the menu button opens a drawer that closes once a page is chosen", async ({ page, browserName }) => {
    await expect(column(page)).toBeHidden();
    await page.getByRole("button", { name: "Open navigation" }).tap();
    await expect(drawer(page)).toBeVisible();
    // A tap during the slide-in lands on a moving item and turns into no click at all.
    await settleAnimations(page);
    const item = drawer(page).getByRole("link", { name: "Actions" });
    // Playwright's WebKit iPhone emulation drops a few percent of taps on links: measured with a bare
    // <a href> outside any dialog and outside React (5 of 120 never navigated). The drawer closes on
    // the click whatever the input, so WebKit gets a click; Chromium keeps the real tap.
    if (browserName === "webkit") await item.click();
    else await item.tap();
    await expect(drawer(page)).toBeHidden();
    await expect(page.getByTestId("page")).toHaveText("Actions");
  });

  test("Escape and the close button close the drawer and return focus to the menu button", async ({ page }) => {
    const menu = page.getByRole("button", { name: "Open navigation" });
    await menu.focus();
    await page.keyboard.press("Enter");
    await expect(drawer(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer(page)).toBeHidden();
    await expect(menu).toBeFocused();
    await menu.tap();
    await settleAnimations(page);
    await drawer(page).getByRole("button", { name: "Close" }).tap();
    await expect(drawer(page)).toBeHidden();
  });

  for (const theme of ["dark", "light"] as const) {
    test(`passes axe with the drawer open in the ${theme} theme`, async ({ page }) => {
      await openFixture(page, "sidebar", theme);
      await page.getByRole("button", { name: "Open navigation" }).tap();
      await expect(drawer(page)).toBeVisible();
      await expectAccessible(page, { modal: true });
    });
  }
});
