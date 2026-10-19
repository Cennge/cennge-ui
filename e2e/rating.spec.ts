import { expect, expectAccessible, openFixture, test } from "./test";
import type { Locator, Page } from "@playwright/test";

const repo = (page: Page) => page.getByRole("radiogroup", { name: "Rate ai-niche-scout" });
const docs = (page: Page) => page.getByRole("slider", { name: "Docs quality" });
const star = (group: Locator, n: number) => group.getByRole("radio", { name: n === 1 ? "1 star" : `${n} stars` });
const filled = (group: Locator) => group.locator('[data-filled="full"]');

/** Click on a phone is a tap. */
async function press(locator: Locator, isMobile: boolean, position?: { x: number; y: number }) {
  if (isMobile) await locator.tap({ position });
  else await locator.click({ position });
}

test.beforeEach(async ({ page }) => {
  await openFixture(page, "rating");
});

test("a click or tap picks a star; a second one on it clears the rating", async ({ page, isMobile }) => {
  const four = star(repo(page), 4);
  await press(four, isMobile);
  await expect(page.getByTestId("repo")).toHaveText("4");
  await expect(four).toHaveAttribute("aria-checked", "true");
  await expect(filled(repo(page))).toHaveCount(4);
  await press(four, isMobile);
  await expect(page.getByTestId("repo")).toHaveText("0");
  await expect(four).toHaveAttribute("aria-checked", "false");
});

test("hover previews a rating; after a click the stars show the result until the pointer moves on", async ({ page, isMobile }) => {
  test.skip(isMobile, "touch screens have no hover");
  const group = repo(page);
  await star(group, 3).hover();
  await expect(filled(group)).toHaveCount(3);
  await expect(star(group, 3)).toHaveAttribute("data-hovered");
  await page.getByRole("button", { name: "Before" }).hover();
  await expect(filled(group)).toHaveCount(0);

  await star(group, 4).click();
  await expect(filled(group)).toHaveCount(4);
  await star(group, 4).click(); // clears; the pointer is still on the fourth star
  await expect(page.getByTestId("repo")).toHaveText("0");
  await expect(filled(group)).toHaveCount(0);
  await star(group, 2).hover();
  await expect(filled(group)).toHaveCount(2);
});

test("keyboard: Tab lands on the chosen star; arrows stop at the ends; Backspace clears", async ({ page }) => {
  const group = repo(page);
  await page.getByRole("button", { name: "Before" }).focus();
  await page.keyboard.press("Tab");
  await expect(star(group, 1)).toBeFocused(); // nothing chosen yet
  await expect(star(group, 1)).toHaveCSS("outline-style", "solid"); // a visible focus ring
  await page.keyboard.press("ArrowRight");
  await expect(star(group, 2)).toBeFocused();
  await expect(page.getByTestId("repo")).toHaveText("2");
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowRight");
  await expect(star(group, 5)).toBeFocused();
  await expect(page.getByTestId("repo")).toHaveText("5");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(star(group, 3)).toBeFocused(); // back on the chosen star
  await page.keyboard.press("Backspace");
  await expect(page.getByTestId("repo")).toHaveText("0");
  await page.keyboard.press("Space");
  await expect(page.getByTestId("repo")).toHaveText("3");
});

test("half stars: the left half of a star picks x.5, the right half the whole star", async ({ page, isMobile }) => {
  const slider = docs(page);
  const third = slider.locator('[data-star="2"]');
  const box = await third.boundingBox();
  if (!box) throw new Error("no box");
  await press(third, isMobile, { x: box.width * 0.25, y: box.height / 2 });
  await expect(page.getByTestId("docs")).toHaveText("2.5");
  await expect(slider).toHaveAttribute("aria-valuetext", "2.5 stars");
  await expect(third).toHaveAttribute("data-filled", "partial");
  await press(third, isMobile, { x: box.width * 0.75, y: box.height / 2 });
  await expect(page.getByTestId("docs")).toHaveText("3");
  await expect(slider).toBeFocused();
});

test("half stars from the keyboard: arrows by half, Page keys by a star, Delete clears", async ({ page }) => {
  const slider = docs(page);
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveAttribute("aria-valuenow", "4");
  await page.keyboard.press("PageDown");
  await expect(slider).toHaveAttribute("aria-valuenow", "3");
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowLeft");
  await expect(slider).toHaveAttribute("aria-valuetext", "0.5 stars");
  await page.keyboard.press("Delete");
  await expect(slider).toHaveAttribute("aria-valuetext", "No rating");
  await expect(page.getByTestId("docs")).toHaveText("0");
});

test("read-only: a picture named with its value, not a tab stop", async ({ page }) => {
  const average = page.getByRole("img", { name: "Average rating: 4.3 stars" });
  await expect(average).toBeVisible();
  await expect(average.locator('[data-filled="full"]')).toHaveCount(4);
  await expect(average.locator('[data-filled="partial"]')).toHaveCount(1);
  await docs(page).focus();
  await page.keyboard.press("Tab");
  // The next stop is the hearts, past the read-only stars.
  await expect(page.getByRole("radiogroup", { name: "Favourite" }).getByRole("radio", { name: "2 stars" })).toBeFocused();
});

test("custom icons work like stars", async ({ page, isMobile }) => {
  const hearts = page.getByRole("radiogroup", { name: "Favourite" });
  await expect(hearts.getByRole("radio")).toHaveCount(3);
  await press(star(hearts, 3), isMobile);
  await expect(star(hearts, 3)).toHaveAttribute("aria-checked", "true");
  await expect(filled(hearts)).toHaveCount(3);
});

test("the rating goes with the form", async ({ page, isMobile }) => {
  const review = page.getByRole("radiogroup", { name: "Release review" });
  await expect(review).toHaveAccessibleDescription("Your rating is public");
  await press(star(review, 2), isMobile);
  await press(page.getByRole("button", { name: "Submit" }), isMobile);
  await expect(page.getByTestId("submitted")).toHaveText("rating=2");
});

test("disabled: skipped by Tab and deaf to clicks", async ({ page }) => {
  const archived = page.getByRole("radiogroup", { name: "Archived (disabled)" });
  await page.getByRole("button", { name: "Submit" }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "After" })).toBeFocused();
  await star(archived, 5).click({ force: true }); // aria-disabled: Playwright would wait for it to be enabled
  await expect(star(archived, 2)).toHaveAttribute("aria-checked", "true");
});

test("every star is at least 24 × 24 px, so it is easy to tap", async ({ page }) => {
  for (const radio of await page.getByRole("radio").all()) {
    const box = await radio.boundingBox();
    expect(box && box.width >= 23.5 && box.height >= 23.5, `${await radio.getAttribute("aria-label")}: ${JSON.stringify(box)}`).toBe(true);
  }
});

for (const theme of ["dark", "light"] as const) {
  test(`empty stars keep 3:1 contrast with the page in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "rating", theme);
    const ratio = await page.evaluate(() => {
      const rgb = (color: string) => (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const luminance = (color: string) => {
        const [r = 0, g = 0, b = 0] = rgb(color).map((v) => {
          const c = v / 255;
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const empty = document.querySelector('[data-star="4"] svg')?.parentElement;
      if (!empty) throw new Error("no empty star");
      let node: Element | null = empty;
      let background = "rgba(0, 0, 0, 0)";
      while (node && /rgba\(.*, 0\)$|transparent/.test(background)) {
        background = getComputedStyle(node).backgroundColor;
        node = node.parentElement;
      }
      const [a, b] = [luminance(getComputedStyle(empty).color), luminance(background)];
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  test(`passes axe in the ${theme} theme`, async ({ page, isMobile }) => {
    await openFixture(page, "rating", theme);
    if (!isMobile) await star(repo(page), 3).hover();
    await docs(page).focus();
    await expectAccessible(page);
  });
}
