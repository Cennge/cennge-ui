import { expect, expectAccessible, openFixture, test } from "./test";
import type { Locator, Page } from "@playwright/test";

const carousel = (page: Page, name: string) => page.getByRole("region", { name });
const slides = (root: Locator) => root.getByRole("group", { name: "Slides" });
const dots = (root: Locator) => root.getByRole("group", { name: "Choose slide" }).getByRole("button");
const current = (root: Locator) => root.getByRole("group", { name: "Choose slide" }).locator('[aria-current="true"]');
const index = (page: Page) => page.getByTestId("index");

/** Click on a phone is a tap. */
async function press(locator: Locator, isMobile: boolean) {
  if (isMobile) await locator.tap();
  else await locator.click();
}

/** The slide whose start is at the start of the view. */
async function visibleSlide(root: Locator) {
  return slides(root).evaluate((node) => {
    const left = node.getBoundingClientRect().left;
    const items = Array.from(node.querySelectorAll<HTMLElement>("[data-carousel-item]"));
    const shown = items.find((item) => Math.abs(item.getBoundingClientRect().left - left) < 2);
    return shown?.getAttribute("aria-label") ?? null;
  });
}

test.beforeEach(async ({ page }) => {
  await openFixture(page, "carousel");
});

test("a named region of slides named \"N of M\"", async ({ page }) => {
  const releases = carousel(page, "Releases");
  await expect(releases).toHaveAttribute("aria-roledescription", "carousel");
  await expect(releases.getByRole("group", { name: "3 of 5" })).toHaveAttribute("aria-roledescription", "slide");
  await expect(dots(releases)).toHaveCount(5);
  await expect(dots(releases).first()).toHaveAccessibleName("Slide 1");
});

test("Next, Previous and the dots move between slides", async ({ page, isMobile }) => {
  const releases = carousel(page, "Releases");
  const next = releases.getByRole("button", { name: "Next slide" });
  const previous = releases.getByRole("button", { name: "Previous slide" });
  await expect(previous).toHaveAttribute("aria-disabled", "true");
  await press(next, isMobile);
  await expect(index(page)).toHaveText("1");
  await expect(current(releases)).toHaveAccessibleName("Slide 2");
  await expect.poll(() => visibleSlide(releases)).toBe("2 of 5");
  await press(dots(releases).nth(3), isMobile);
  await expect(index(page)).toHaveText("3");
  await expect.poll(() => visibleSlide(releases)).toBe("4 of 5");
  await press(previous, isMobile);
  await expect(index(page)).toHaveText("2");
  // The move is announced.
  await expect(releases.locator('[aria-live="polite"]')).toHaveText("3 of 5");
});

test("at the end Next stays focused but does nothing", async ({ page }) => {
  const releases = carousel(page, "Releases");
  const next = releases.getByRole("button", { name: "Next slide" });
  await next.focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press("Enter");
  await expect(index(page)).toHaveText("4");
  await expect(next).toHaveAttribute("aria-disabled", "true");
  await expect(next).toBeFocused();
  await expect.poll(() => visibleSlide(releases)).toBe("5 of 5");
});

test("keyboard on the slides: arrows, Home and End", async ({ page }) => {
  const list = slides(carousel(page, "Releases"));
  await page.getByRole("button", { name: "Before" }).focus();
  await page.keyboard.press("Tab");
  await expect(list).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(index(page)).toHaveText("1");
  await page.keyboard.press("End");
  await expect(index(page)).toHaveText("4");
  await page.keyboard.press("Home");
  await expect(index(page)).toHaveText("0");
  await page.keyboard.press("ArrowLeft"); // already at the start
  await expect(index(page)).toHaveText("0");
});

test("the dots are one tab stop; arrow keys move along them", async ({ page }) => {
  const releases = carousel(page, "Releases");
  await dots(releases).first().focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(dots(releases).nth(2)).toBeFocused();
  await expect(index(page)).toHaveText("2");
  await page.keyboard.press("End");
  await expect(dots(releases).nth(4)).toBeFocused();
  await expect(dots(releases).nth(4)).toHaveAttribute("tabindex", "0");
  await expect(dots(releases).nth(0)).toHaveAttribute("tabindex", "-1");
});

test("a swipe or a scroll lands on a slide and moves the dots", async ({ page }) => {
  const releases = carousel(page, "Releases");
  // A finger flick or trackpad scroll is native scrolling; snapping finishes it on a slide.
  await slides(releases).evaluate((node) => node.scrollBy({ left: node.clientWidth * 1.3 }));
  await expect(index(page)).toHaveText("1");
  await expect.poll(() => visibleSlide(releases)).toBe("2 of 5");
});

test("a mouse drags the slides; dropping on a link does not open it", async ({ page, isMobile }) => {
  test.skip(isMobile, "fingers scroll natively");
  const releases = carousel(page, "Releases");
  const link = releases.getByRole("link", { name: "Release notes" }).first();
  const box = await link.boundingBox();
  if (!box) throw new Error("no link");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 140, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect(index(page)).toHaveText("1");
  await expect.poll(() => visibleSlide(releases)).toBe("2 of 5");
  await expect(page.getByTestId("opened")).toHaveText("");
  // A short drag settles back, and a plain click still opens the link.
  const second = releases.getByRole("link", { name: "Release notes" }).nth(1);
  const start = await second.boundingBox();
  if (!start) throw new Error("no link");
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(start.x + start.width / 2 - 20, start.y + start.height / 2, { steps: 4 });
  await page.mouse.up();
  await expect.poll(() => visibleSlide(releases)).toBe("2 of 5");
  await second.click();
  await expect(page.getByTestId("opened")).toHaveText("v0.4.0 Rating");
});

test("the index can be set from outside", async ({ page, isMobile }) => {
  await press(page.getByRole("button", { name: "Last release" }), isMobile);
  await expect(index(page)).toHaveText("4");
  await expect.poll(() => visibleSlide(carousel(page, "Releases"))).toBe("5 of 5");
});

test("several slides per view: dots are pages, Next moves one slide", async ({ page, isMobile }) => {
  const repos = carousel(page, "Repositories");
  // Seven slides, two at a time: six stops.
  await expect(dots(repos)).toHaveCount(6);
  await expect(dots(repos).first()).toHaveAccessibleName("Page 1");
  await press(repos.getByRole("button", { name: "Next slide" }), isMobile);
  await expect(current(repos)).toHaveAccessibleName("Page 2");
  await expect.poll(() => visibleSlide(repos)).toBe("2 of 7");
  await expect(repos.locator('[aria-live="polite"]')).toHaveText("Page 2 of 6");
});

test("autoplay moves on, pauses under the mouse, and stops when focus comes in", async ({ page, isMobile }) => {
  const tipsCarousel = carousel(page, "Tips");
  await expect(tipsCarousel.getByRole("button", { name: "Pause slide show" })).toBeVisible();
  await expect(current(tipsCarousel)).toHaveAccessibleName("Slide 2", { timeout: 5000 });
  // While it plays, moves are not announced.
  await expect(tipsCarousel.locator("[aria-live]")).toHaveAttribute("aria-live", "off");
  if (!isMobile) {
    await slides(tipsCarousel).hover();
    await page.waitForTimeout(2000);
    await expect(current(tipsCarousel)).toHaveAccessibleName("Slide 2");
    await page.getByRole("button", { name: "After" }).hover();
    await expect(current(tipsCarousel)).toHaveAccessibleName("Slide 3", { timeout: 5000 });
  }
  // Loop: after the last slide comes the first.
  await expect(current(tipsCarousel)).toHaveAccessibleName("Slide 1", { timeout: 8000 });
  await slides(tipsCarousel).focus();
  await expect(tipsCarousel.getByRole("button", { name: "Play slide show" })).toBeVisible();
  await expect(tipsCarousel.locator("[aria-live]")).toHaveAttribute("aria-live", "polite");
  await page.waitForTimeout(2000);
  await expect(current(tipsCarousel)).toHaveAccessibleName("Slide 1");
  await press(tipsCarousel.getByRole("button", { name: "Play slide show" }), isMobile);
  await expect(tipsCarousel.getByRole("button", { name: "Pause slide show" })).toBeVisible();
  // It waits while the mouse is still over it after the click.
  if (!isMobile) await page.getByRole("button", { name: "After" }).hover();
  await expect(current(tipsCarousel)).toHaveAccessibleName("Slide 2", { timeout: 5000 });
});

test("a click on Pause pauses, and a click on Play plays", async ({ page, isMobile }) => {
  // A click focuses the button first (except in Safari), and focus coming in stops autoplay:
  // the click must still pause rather than undo that stop.
  const tipsCarousel = carousel(page, "Tips");
  await press(tipsCarousel.getByRole("button", { name: "Pause slide show" }), isMobile);
  await expect(tipsCarousel.getByRole("button", { name: "Play slide show" })).toBeVisible();
  await page.waitForTimeout(2000);
  await expect(current(tipsCarousel)).toHaveAccessibleName("Slide 1");
  await press(tipsCarousel.getByRole("button", { name: "Play slide show" }), isMobile);
  await expect(tipsCarousel.getByRole("button", { name: "Pause slide show" })).toBeVisible();
});

test("with reduced motion autoplay waits for the play button", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openFixture(page, "carousel");
  const tipsCarousel = carousel(page, "Tips");
  await expect(tipsCarousel.getByRole("button", { name: "Play slide show" })).toBeVisible();
  await page.waitForTimeout(2000);
  await expect(current(tipsCarousel)).toHaveAccessibleName("Slide 1");
});

test("loop: Previous on the first slide goes to the last", async ({ page, isMobile }) => {
  const tipsCarousel = carousel(page, "Tips");
  await press(tipsCarousel.getByRole("button", { name: "Pause slide show" }), isMobile);
  await expect(tipsCarousel.getByRole("button", { name: "Play slide show" })).toBeVisible();
  await press(dots(tipsCarousel).first(), isMobile);
  await press(tipsCarousel.getByRole("button", { name: "Previous slide" }), isMobile);
  await expect(current(tipsCarousel)).toHaveAccessibleName("Slide 3");
});

test("image galleries can have the arrows over the slides", async ({ page, isMobile }) => {
  const shots = carousel(page, "Screenshots");
  const next = shots.getByRole("button", { name: "Next slide" });
  const box = await next.boundingBox();
  const view = await slides(shots).boundingBox();
  if (!box || !view) throw new Error("no box");
  expect(box.y).toBeGreaterThan(view.y);
  expect(box.y + box.height).toBeLessThan(view.y + view.height); // on top of the slide
  await press(next, isMobile);
  await expect(current(shots)).toHaveAccessibleName("Slide 2");
});

test("the controls row keeps arrows off the slides", async ({ page }) => {
  const releases = carousel(page, "Releases");
  const next = await releases.getByRole("button", { name: "Next slide" }).boundingBox();
  const view = await slides(releases).boundingBox();
  if (!next || !view) throw new Error("no box");
  expect(next.y).toBeGreaterThanOrEqual(view.y + view.height);
});

test("a single slide has no arrows and no dots", async ({ page }) => {
  const pinned = carousel(page, "Pinned");
  await expect(pinned.getByRole("button")).toHaveCount(0);
  await expect(dots(pinned)).toHaveCount(0);
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" }); // a still page to check
    await openFixture(page, "carousel", theme);
    await expectAccessible(page);
  });
}
