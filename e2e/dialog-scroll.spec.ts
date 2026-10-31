import { expect, expectAccessible, openFixture, settleAnimations, test } from "./test";
import type { Locator, Page } from "@playwright/test";

/*
 * Radix #1159: a modal dialog stops scrolling outside its own React tree, and a list in a portal (a
 * Combobox's, a Popover's) opened from inside the dialog was left out, so it would not scroll at all.
 * Radix Dialog 1.3 lets nested layers scroll (Radix #3423); these keep it so in Dialog, Drawer and
 * AlertDialog, for each kind of list.
 */

/** A click on a phone is a tap. */
async function press(locator: Locator, isMobile: boolean) {
  if (isMobile) await locator.tap();
  else await locator.click();
}

/** The box that scrolls: the element itself or the nearest one around it. */
const scroller = (target: Locator) =>
  target.evaluateHandle((element) => {
    for (let node: Element | null = element; node; node = node.parentElement) {
      if (/auto|scroll/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight) return node;
    }
    throw new Error("nothing scrolls here");
  });

const scrollTop = async (target: Locator) => (await scroller(target)).evaluate((node) => (node as Element).scrollTop);

/** The wheel over the middle of what scrolls, as on a desktop. */
async function wheelOver(page: Page, target: Locator, distance: number) {
  const box = await (await scroller(target)).evaluate((node) => (node as Element).getBoundingClientRect().toJSON());
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, distance);
}

/**
 * Playwright cannot swipe on a phone (a CDP scroll gesture moves nothing in headless Chromium, and
 * WebKit has no Touch objects to send). So the events a swipe up sends go to what is under the finger,
 * and what is checked is whether the dialog's scroll lock cancels them: that is how it stops a scroll.
 * WebKit gets the wheel event instead; the lock decides both the same way.
 */
async function isSwipeCancelled(page: Page, x: number, y: number, browserName: string) {
  return page.evaluate(
    ([x, y, useTouch]) => {
      const element = document.elementFromPoint(x, y)!;
      if (!useTouch) {
        const wheel = new WheelEvent("wheel", { deltaY: 60, bubbles: true, cancelable: true, clientX: x, clientY: y });
        element.dispatchEvent(wheel);
        return wheel.defaultPrevented;
      }
      const touch = (clientY: number) => new Touch({ identifier: 1, target: element, clientX: x, clientY });
      const send = (type: string, clientY: number) => {
        const event = new TouchEvent(type, {
          bubbles: true,
          cancelable: true,
          touches: type === "touchend" ? [] : [touch(clientY)],
          changedTouches: [touch(clientY)],
        });
        element.dispatchEvent(event);
        return event.defaultPrevented;
      };
      send("touchstart", y);
      const isCancelled = send("touchmove", y - 60);
      send("touchend", y - 60);
      return isCancelled;
    },
    [x, y, browserName === "chromium"] as const,
  );
}

async function swipeOver(page: Page, target: Locator, browserName: string) {
  const box = await (await scroller(target)).evaluate((node) => (node as Element).getBoundingClientRect().toJSON());
  return isSwipeCancelled(page, box.x + box.width / 2, box.y + box.height / 2, browserName);
}

const cases: { title: string; open: (page: Page, isMobile: boolean) => Promise<void>; list: (page: Page) => Locator }[] = [
  {
    title: "a Combobox in a Dialog",
    open: async (page, isMobile) => {
      await press(page.getByRole("button", { name: "Move issues" }), isMobile);
      await press(page.getByRole("combobox", { name: "Branch" }), isMobile);
    },
    list: (page) => page.getByRole("listbox", { name: "Branch" }),
  },
  {
    title: "a Popover in a Dialog",
    open: async (page, isMobile) => {
      await press(page.getByRole("button", { name: "Move issues" }), isMobile);
      await press(page.getByRole("button", { name: "Activity" }), isMobile);
    },
    list: (page) => page.getByRole("list", { name: "Activity" }),
  },
  {
    title: "another library's popup in a Dialog",
    open: async (page, isMobile) => {
      await press(page.getByRole("button", { name: "Move issues" }), isMobile);
      await press(page.getByRole("button", { name: "Mentions" }), isMobile);
    },
    list: (page) => page.getByRole("list", { name: "Mentions" }),
  },
  {
    // Radix Select has a scroll lock of its own.
    title: "a Select in a Dialog",
    open: async (page, isMobile) => {
      await press(page.getByRole("button", { name: "Move issues" }), isMobile);
      await press(page.getByRole("combobox", { name: "Runner" }), isMobile);
    },
    list: (page) => page.getByRole("listbox").locator("[data-radix-select-viewport]"),
  },
  {
    title: "a Combobox in a Drawer",
    open: async (page, isMobile) => {
      await press(page.getByRole("button", { name: "Filters" }), isMobile);
      await press(page.getByRole("combobox", { name: "Label" }), isMobile);
    },
    list: (page) => page.getByRole("listbox", { name: "Label" }),
  },
  {
    title: "a Combobox in an AlertDialog",
    open: async (page, isMobile) => {
      await press(page.getByRole("button", { name: "Transfer payload-cache" }), isMobile);
      await press(page.getByRole("combobox", { name: "New owner" }), isMobile);
    },
    list: (page) => page.getByRole("listbox", { name: "New owner" }),
  },
];

test.beforeEach(async ({ page }) => {
  await openFixture(page, "dialog-scroll");
});

for (const { title, open, list } of cases) {
  test(`${title}: the list scrolls, and past its end the page behind it does not`, async ({ page, isMobile, browserName }) => {
    await open(page, isMobile);
    const target = list(page);
    await expect(target).toBeVisible();
    expect(await scrollTop(target)).toBe(0);
    if (!isMobile) {
      await wheelOver(page, target, 100);
      await expect.poll(() => scrollTop(target)).toBeGreaterThan(0);
      // On to the end a notch at a time, as a wheel turns (one long flick past the end is cancelled whole),
      // and on past it.
      for (let notch = 0; notch < 30; notch++) await page.mouse.wheel(0, 100);
      const remaining = async () => (await scroller(target)).evaluate((node) => {
        const box = node as Element;
        return box.scrollHeight - box.clientHeight - box.scrollTop;
      });
      await expect.poll(remaining).toBeLessThan(100);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
    } else {
      expect(await swipeOver(page, target, browserName), "the swipe was cancelled: the list would not scroll").toBe(false);
      // At the end of the list the same swipe would scroll the page: the lock keeps it to the list.
      await (await scroller(target)).evaluate((node) => ((node as Element).scrollTop = (node as Element).scrollHeight));
      expect(await swipeOver(page, target, browserName), "past the end, the swipe reached the page").toBe(true);
    }
  });
}

test("a Select's chevron turns with its own list, not with the open dialog around it", async ({ page, isMobile }) => {
  await press(page.getByRole("button", { name: "Move issues" }), isMobile);
  // An open Select hides the rest of the page from the accessibility tree, its own trigger included.
  const trigger = page.getByRole("combobox", { name: "Runner", includeHidden: true });
  const chevron = trigger.locator('span[aria-hidden="true"]');
  await settleAnimations(page);
  await expect(chevron).toHaveCSS("rotate", "none");
  await press(trigger, isMobile);
  await expect(page.getByRole("listbox")).toBeVisible();
  await settleAnimations(page);
  await expect(chevron).toHaveCSS("rotate", "180deg");
});

test("the backdrop does not scroll the page", async ({ page, isMobile, browserName }) => {
  await press(page.getByRole("button", { name: "Move issues" }), isMobile);
  await expect(page.getByRole("dialog", { name: "Move issues" })).toBeVisible();
  const { height } = page.viewportSize()!;
  if (isMobile) {
    expect(await isSwipeCancelled(page, 8, height - 8, browserName)).toBe(true);
  } else {
    await page.mouse.move(8, height - 8);
    await page.mouse.wheel(0, 600);
    // Nothing to wait for if it works: give a scroll that should not happen the time to show.
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  }
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe with a list open in a Dialog, ${theme} theme`, async ({ page, isMobile }) => {
    await openFixture(page, "dialog-scroll", theme);
    await press(page.getByRole("button", { name: "Move issues" }), isMobile);
    await press(page.getByRole("button", { name: "Activity" }), isMobile);
    await expect(page.getByRole("list", { name: "Activity" })).toBeVisible();
    await expectAccessible(page, { modal: true });
  });
}
