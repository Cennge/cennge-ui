import { expect, expectAccessible, serveMapTilesOffline, test } from "./test";

test.describe("playground", () => {
  // The map demo draws OpenFreeMap's tiles.
  test.beforeEach(async ({ page }) => {
    await serveMapTilesOffline(page);
  });

  test("renders every demo without console errors", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "cennge-ui", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Button: цвета × варианты" })).toBeVisible();
  });

  test("nothing is wider than the screen: no sideways scrolling", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "cennge-ui", level: 1 })).toBeVisible();
    // A grid column without minmax(0, 1fr) grows to its widest line and pushes the page sideways on a phone.
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth))
      .toBe(0);
  });

  // shadcn/ui #6843: buttons that show the arrow read as not clickable. Every control on the page is checked.
  test("every enabled control shows the pointer cursor", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Button: цвета × варианты" })).toBeVisible();
    const offenders = await page.evaluate(() => {
      const controls = document.querySelectorAll<HTMLElement>(
        'button, [role="button"], [role="tab"], [role="switch"], [role="checkbox"], [role="radio"], [role="option"], [role="menuitem"], [role="treeitem"]',
      );
      const describe = (element: HTMLElement) =>
        `${element.tagName.toLowerCase()}[${element.getAttribute("role") ?? ""}] "${(element.getAttribute("aria-label") ?? element.textContent ?? "").trim().slice(0, 40)}" → ${getComputedStyle(element).cursor}`;
      return [...controls]
        .filter((element) => element.getClientRects().length > 0)
        .filter((element) => !element.matches(":disabled, [aria-disabled='true'], [data-disabled], [data-loading]"))
        .filter((element) => getComputedStyle(element).cursor !== "pointer")
        .map(describe);
    });
    expect(offenders).toEqual([]);
  });

  test("switches theme and accent", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
    await page.getByRole("radio", { name: "Светлая" }).click();
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
    await page.getByRole("radio", { name: "Светлая" }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expectAccessible(page);
  });
});
