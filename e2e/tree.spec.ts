import { expect, expectAccessible, openFixture, test } from "./test";
import type { Page } from "@playwright/test";

const item = (page: Page, name: string) => page.getByRole("treeitem", { name, exact: true });

test.beforeEach(async ({ page }) => {
  await openFixture(page, "tree");
});

test("keyboard: Tab enters at one item; arrows walk, open and close; typing jumps; Enter opens", async ({ page }) => {
  await page.getByRole("button", { name: "Before" }).focus();
  await page.keyboard.press("Tab");
  await expect(item(page, ".github")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(item(page, "src")).toBeFocused();
  await page.keyboard.press("ArrowRight"); // already open: into the first child
  await expect(item(page, "components")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(item(page, "components")).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("ArrowDown");
  await expect(item(page, "button.tsx")).toBeFocused();
  await page.keyboard.press("ArrowLeft"); // a file: to its folder
  await expect(item(page, "components")).toBeFocused();
  await page.keyboard.press("r");
  await expect(item(page, "README.md")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("opened")).toHaveText("README.md");
  await expect(item(page, "README.md")).toHaveAttribute("aria-selected", "true");

  // Tab leaves the tree in one step.
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "After" })).toBeFocused();
});

test("a click or tap opens folders and files", async ({ page, isMobile }) => {
  const tap = (name: string) => (isMobile ? item(page, name).tap() : item(page, name).click());
  await tap(".github");
  await expect(item(page, ".github")).toHaveAttribute("aria-expanded", "true");
  await tap("ci.yml");
  await expect(page.getByTestId("opened")).toHaveText(".github/workflows/ci.yml");
  await tap("src");
  await expect(item(page, "index.ts")).toBeHidden();
});

test("a folder loads its files on first open; a failed load can be retried", async ({ page }) => {
  await item(page, "docs").click();
  await expect(item(page, "docs")).toHaveAttribute("aria-busy", "true");
  await page.evaluate(() => window.finishDocs?.(false));
  await expect(page.getByTestId("errors")).toHaveText("1");
  await expect(item(page, "docs")).toHaveAttribute("aria-expanded", "false");

  await item(page, "docs").click();
  await page.evaluate(() => window.finishDocs?.(true));
  await expect(item(page, "theming.md")).toBeVisible();
  await expect(item(page, "docs")).not.toHaveAttribute("aria-busy");
  await expect(item(page, "theming.md")).toHaveAttribute("aria-level", "2");
});

test("rows indent by level", async ({ page }) => {
  await item(page, "components").click();
  const left = async (name: string) => {
    const label = item(page, name).locator("span").last();
    return (await label.boundingBox())?.x ?? 0;
  };
  const [level1, level2, level3] = [await left("src"), await left("components"), await left("button.tsx")];
  expect(level2 - level1).toBeGreaterThan(10);
  expect(level3 - level2).toBeGreaterThan(10);
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "tree", theme);
    await item(page, "index.ts").click();
    await expectAccessible(page);
  });
}
