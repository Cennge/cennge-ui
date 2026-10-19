import { expect, expectAccessible, openFixture, test } from "./test";
import type { Page } from "@playwright/test";

const column = (page: Page) => page.getByRole("complementary", { name: "Cennge/cennge-ui" });
const drawer = (page: Page) => page.getByRole("dialog", { name: "Cennge/cennge-ui" });

test.beforeEach(async ({ page }) => {
  await openFixture(page, "sidebar");
});

test.describe("desktop", () => {
  test.skip(({ isMobile }) => isMobile, "Desktop layout");

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

  test("passes axe, expanded and collapsed, in both themes", async ({ page }) => {
    await expectAccessible(page);
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await expectAccessible(page);
    await openFixture(page, "sidebar", "light");
    await expectAccessible(page);
  });
});

test.describe("phone", () => {
  test.skip(({ isMobile }) => !isMobile, "Phone layout");

  test("the menu button opens a drawer that closes once a page is chosen", async ({ page }) => {
    await expect(column(page)).toBeHidden();
    await page.getByRole("button", { name: "Open navigation" }).tap();
    await expect(drawer(page)).toBeVisible();
    await drawer(page).getByRole("link", { name: "Actions" }).tap();
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
    await drawer(page).getByRole("button", { name: "Close" }).tap();
    await expect(drawer(page)).toBeHidden();
  });

  test("passes axe with the drawer open, in both themes", async ({ page }) => {
    await page.getByRole("button", { name: "Open navigation" }).tap();
    await expect(drawer(page)).toBeVisible();
    await expectAccessible(page, { modal: true });
    await openFixture(page, "sidebar", "light");
    await page.getByRole("button", { name: "Open navigation" }).tap();
    await expectAccessible(page, { modal: true });
  });
});
