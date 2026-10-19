import { expect, expectAccessible, openFixture, test } from "./test";
import type { Locator, Page } from "@playwright/test";

const repos = (page: Page) => page.getByRole("table", { name: "Repositories" });
const firstColumnTexts = (table: Locator, column: number) =>
  table.locator("tbody tr").evaluateAll(
    (rows, index) => rows.map((row) => (row as HTMLTableRowElement).cells[index]?.textContent ?? ""),
    column,
  );

test.describe("Table", () => {
  test.beforeEach(async ({ page }) => {
    await openFixture(page, "table");
  });

  test("sorting from the keyboard or pointer updates aria-sort and the order", async ({ page, isMobile }) => {
    const table = repos(page);
    const stars = table.getByRole("button", { name: "Stars" });
    if (isMobile) await stars.tap();
    else await stars.click();
    await expect(table.getByRole("columnheader", { name: "Stars" })).toHaveAttribute("aria-sort", "ascending");
    expect(await firstColumnTexts(table, 1)).toEqual(["Blog", "ai-niche-scout", "cennge-ui", "dotfiles"]);

    await table.getByRole("button", { name: "Release" }).focus();
    await page.keyboard.press("Enter");
    await expect(table.getByRole("columnheader", { name: "Stars" })).toHaveAttribute("aria-sort", "none");
    expect(await firstColumnTexts(table, 4)).toEqual(["v1", "v2", "v9", "v10"]);
    await page.keyboard.press("Enter");
    expect(await firstColumnTexts(table, 4)).toEqual(["v10", "v9", "v2", "v1"]);
  });

  test("checkboxes select rows; the header box shows a partial selection", async ({ page }) => {
    const table = repos(page);
    await table.getByRole("checkbox", { name: "Select cennge-ui" }).click();
    await expect(table.getByRole("checkbox", { name: "Select all" })).toHaveAttribute("aria-checked", "mixed");
    await expect(table.getByRole("row").filter({ hasText: "cennge-ui" })).toHaveAttribute("data-selected", "true");
    await table.getByRole("checkbox", { name: "Select all" }).click();
    await expect(page.getByTestId("selected")).toHaveText("cennge-ui,ai-niche-scout,dotfiles,Blog");
  });

  test("empty and loading states span every column", async ({ page }) => {
    await page.getByRole("button", { name: "Empty" }).click();
    await expect(repos(page).getByRole("cell", { name: "No repositories yet" })).toHaveAttribute("colspan", "5");
    await page.getByRole("button", { name: "Toggle loading" }).click();
    await expect(repos(page)).toHaveAttribute("aria-busy", "true");
    await expect(repos(page).getByRole("cell", { name: "Loading…" })).toBeVisible();
  });

  test("a table that does not fit scrolls as a named region, with the header kept in view", async ({ page, isMobile }) => {
    const region = page.getByRole("region", { name: "Workflow runs" });
    await expect(region).toHaveAttribute("tabindex", "0");
    // A table that fits is just a table; on a phone this one does not fit either.
    await expect(page.getByRole("region", { name: "Repositories" })).toHaveCount(isMobile ? 1 : 0);
    await region.focus();
    for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowDown");
    await expect.poll(() => region.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
    const [regionBox, headerBox] = [await region.boundingBox(), await region.locator("th").first().boundingBox()];
    expect(Math.abs((headerBox?.y ?? 0) - (regionBox?.y ?? 0))).toBeLessThanOrEqual(2);
  });

  for (const theme of ["dark", "light"] as const) {
    test(`passes axe in the ${theme} theme`, async ({ page }) => {
      await openFixture(page, "table", theme);
      await repos(page).getByRole("checkbox", { name: "Select cennge-ui" }).click();
      await repos(page).getByRole("button", { name: "Stars" }).click();
      await expectAccessible(page);
    });
  }
});

test.describe("Table with TanStack Table", () => {
  test.beforeEach(async ({ page }) => {
    await openFixture(page, "table-tanstack");
  });

  test("TanStack sorting and paging drive the table", async ({ page }) => {
    const table = page.getByRole("table", { name: "Services" });
    await table.getByRole("button", { name: "Repository" }).click();
    await expect(table.getByRole("columnheader", { name: "Repository" })).toHaveAttribute("aria-sort", "ascending");
    expect(await firstColumnTexts(table, 0)).toEqual(["service-1", "service-2", "service-3", "service-4", "service-5"]);
    await table.getByRole("button", { name: "Repository" }).click();
    await expect(table.getByRole("columnheader", { name: "Repository" })).toHaveAttribute("aria-sort", "descending");
    expect((await firstColumnTexts(table, 0))[0]).toBe("service-23");

    await page.getByRole("button", { name: /^(Page )?2$/ }).click();
    expect((await firstColumnTexts(table, 0))[0]).toBe("service-18");
  });

  test("passes axe", async ({ page }) => {
    await page.getByRole("table", { name: "Services" }).getByRole("button", { name: "Stars" }).click();
    await expectAccessible(page);
  });
});
