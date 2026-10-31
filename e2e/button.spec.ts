import { expect, expectAccessible, openFixture, settleAnimations, test } from "./test";
import type { Locator, Page } from "@playwright/test";

const cursorOf = (locator: Locator) => locator.evaluate((element) => getComputedStyle(element).cursor);

/** A click on a phone is a tap. At the element's centre, wherever pointer events take it. */
async function pressAt(page: Page, locator: Locator, isMobile: boolean) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("not on screen");
  const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
  if (isMobile) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}

test.beforeEach(async ({ page }) => {
  await openFixture(page, "button");
});

// shadcn/ui #6843: a button with the arrow cursor reads as not clickable.
test("shows the pointer; a loading button shows the wait cursor, and it is the one under the pointer", async ({ page }) => {
  expect(await cursorOf(page.getByRole("button", { name: "Save", exact: true }))).toBe("pointer");
  const loading = page.getByRole("button", { name: /Saving/ });
  expect(await cursorOf(loading)).toBe("wait");
  // A cursor is that of whatever is under the pointer: with pointer events off it was the page's arrow.
  const isHit = await loading.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const under = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return under !== null && element.contains(under);
  });
  expect(isHit).toBe(true);
  // A disabled one still lets the pointer through, so nothing reacts to it.
  const archived = page.getByRole("button", { name: "Archived" });
  expect(await archived.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe("none");
});

test("a loading button neither lights up on hover nor takes a click", async ({ page, isMobile }) => {
  const loading = page.getByRole("button", { name: /Saving/ });
  const look = (locator: Locator) =>
    locator.evaluate((element) => {
      const style = getComputedStyle(element);
      return [style.filter, style.backgroundColor, style.scale, style.transform].join(" ");
    });
  if (!isMobile) {
    const before = await look(loading);
    await loading.hover();
    await settleAnimations(page);
    expect(await look(loading)).toBe(before);
    // An enabled one does light up, so the check above can fail.
    const save = page.getByRole("button", { name: "Save", exact: true });
    const idle = await look(save);
    await save.hover();
    await settleAnimations(page);
    expect(await look(save)).not.toBe(idle);
  }
  await pressAt(page, loading, isMobile);
  await expect(page.getByTestId("clicks")).toHaveText("clicks 0");
});

test("a disabled or loading link does not navigate, on a click or on Enter", async ({ page, isMobile }) => {
  for (const name of ["Settings", "Deploys"]) {
    const link = page.getByRole("link", { name });
    await expect(link).toHaveAttribute("aria-disabled", "true");
    await link.focus();
    await page.keyboard.press("Enter");
    await pressAt(page, link, isMobile);
  }
  await expect(page.getByTestId("clicks")).toHaveText("clicks 0");
  await expect(page).not.toHaveURL(/#(settings|deploys)$/);
  // An enabled one does, so the checks above can fail.
  await page.getByRole("link", { name: "Releases" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#releases$/);
});

test("pagination: a disabled arrow is dimmed and lets the pointer through, the others show the pointer", async ({ page }) => {
  const previous = page.getByRole("button", { name: "Previous page" });
  await expect(previous).toBeDisabled();
  const state = await previous.evaluate((element) => {
    const style = getComputedStyle(element);
    return { pointerEvents: style.pointerEvents, isDimmed: Number(style.opacity) < 1 };
  });
  expect(state).toEqual({ pointerEvents: "none", isDimmed: true });
  expect(await cursorOf(page.getByRole("button", { name: "Next page" }))).toBe("pointer");
  expect(await cursorOf(page.getByRole("button", { name: "Page 2" }))).toBe("pointer");
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "button", theme);
    await expectAccessible(page);
  });
}
