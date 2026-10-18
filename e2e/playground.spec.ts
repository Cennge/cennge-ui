import { expect, expectAccessible, test } from "./test";

test.describe("playground", () => {
  test("renders every demo without console errors", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "cennge-ui", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Button: цвета × варианты" })).toBeVisible();
  });

  test("switches theme and accent", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
    await page.getByRole("button", { name: "Светлая тема" }).click();
    await expect(html).not.toHaveClass(/dark/);
    await page.getByRole("button", { name: "blue", exact: true }).click();
    await expect(html).toHaveAttribute("data-accent", "blue");
  });

  // Every component on one page: a regression net for contrast and ARIA in both themes.
  test("passes an axe audit in the dark theme", async ({ page }) => {
    await page.goto("/");
    await expectAccessible(page);
  });

  test("passes an axe audit in the light theme", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Светлая тема" }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expectAccessible(page);
  });
});
