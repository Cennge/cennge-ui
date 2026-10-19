import type { Page } from "@playwright/test";
// Fails every test on a console error or warning, hydration mismatches included.
import { expect, test } from "../../e2e/test";

async function open(page: Page) {
  await page.goto("/");
  await expect(page.locator("html[data-hydrated]")).toBeAttached({ timeout: 30_000 });
}

test("the server renders the components, not just the browser", async ({ request }) => {
  const html = await (await request.get("/")).text();
  // From the Server Component, and from client components rendered on the server.
  expect(html).toContain("Rendered by a Server Component");
  expect(html).toContain("Песочница компонентов");
  expect(html).toContain('role="grid"');
});

test("hydrates without a single error or warning", async ({ page }) => {
  await open(page);
  // React reports some mismatches a moment after the commit.
  await page.waitForTimeout(1000);
});

test("the package's classes and tokens reach the page", async ({ page }) => {
  await open(page);
  const download = page.getByRole("button", { name: "Download" });
  await expect(download).toHaveCSS("background-color", /^rgb\(/);
  expect(await download.evaluate((node) => getComputedStyle(node).getPropertyValue("--cennge-primary"))).not.toBe("");
});

test("a server action: its error under the field, then a toast from the layout's Toaster", async ({ page }) => {
  await open(page);
  const form = page.getByRole("form", { name: "Server action" });
  const field = form.getByLabel("GitHub repository");

  await field.fill("left-pad");
  await form.getByRole("button", { name: "Save" }).click();
  await expect(form.getByText('No repository named "left-pad"')).toBeVisible();
  await expect(field).toBeFocused();
  await expect(field).toHaveValue("left-pad");

  await field.fill("payload-cache");
  await form.getByRole("button", { name: "Save" }).click();
  await expect(page.locator("[data-slot=toast]", { hasText: "Saved payload-cache" })).toBeVisible();
});
