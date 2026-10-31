import { expect, expectAccessible, openFixture, settleAnimations, test } from "./test";
import type { Locator, Page } from "@playwright/test";

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const focusIsInside = (container: Locator) => container.evaluate((node) => node.contains(document.activeElement));
const bodyStyle = (page: Page) =>
  page.evaluate(() => ({
    overflow: getComputedStyle(document.body).overflow,
    pointerEvents: getComputedStyle(document.body).pointerEvents,
  }));

test.beforeEach(async ({ page }) => {
  await openFixture(page, "overlays");
});

test.describe("Dialog", () => {
  test("traps focus, locks scroll, closes on Escape and returns focus to the trigger", async ({ page }) => {
    await button(page, "Open dialog").click();
    const dialog = page.getByRole("dialog", { name: "Delete project" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleDescription("This cannot be undone.");
    expect(await focusIsInside(dialog)).toBe(true);
    expect((await bodyStyle(page)).overflow).toBe("hidden");

    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      expect(await focusIsInside(dialog)).toBe(true);
    }
    await page.keyboard.press("Shift+Tab");
    expect(await focusIsInside(dialog)).toBe(true);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(button(page, "Open dialog")).toBeFocused();
    // The lock goes with the backdrop, which fades out a moment after the dialog in it.
    await expect.poll(() => bodyStyle(page)).toEqual({ overflow: "visible", pointerEvents: "auto" });
  });

  test("closes when the backdrop is clicked or tapped", async ({ page, isMobile }) => {
    await button(page, "Open dialog").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    if (isMobile) await page.touchscreen.tap(5, 5);
    else await page.mouse.click(5, 5);
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("a menu inside the dialog: the first Escape closes only the menu", async ({ page }) => {
    await button(page, "Open dialog").click();
    await button(page, "More").click();
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toBeHidden();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(button(page, "More")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("opened from code, it returns focus to what had it on close", async ({ page }) => {
    const opener = button(page, "Settings from code");
    await opener.focus();
    await page.keyboard.press("Enter");
    const settings = page.getByRole("dialog", { name: "Settings" });
    await expect(settings).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(settings).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("without a body, the buttons keep their distance from the description and the edge", async ({ page }) => {
    await button(page, "Actions").click();
    await page.getByRole("menuitem", { name: "Open settings" }).click();
    const settings = page.getByRole("dialog", { name: "Settings" });
    await expect(settings).toBeVisible();
    await settleAnimations(page);
    const description = await settings.getByText("Opened from a menu item.").boundingBox();
    const done = await button(page, "Done").boundingBox();
    const box = await settings.boundingBox();
    if (!description || !done || !box) throw new Error("no box");
    expect(done.y - (description.y + description.height)).toBeGreaterThanOrEqual(15);
    expect(box.y + box.height - (done.y + done.height)).toBeGreaterThanOrEqual(23);
  });

  test("passes axe while open", async ({ page }) => {
    await button(page, "Open dialog").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectAccessible(page, { modal: true });
  });
});

test.describe("Dropdown", () => {
  test("keyboard: open, move, typeahead, Escape returns focus", async ({ page }) => {
    await button(page, "Actions").focus();
    await page.keyboard.press("Enter");
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Edit" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "Open settings" })).toBeFocused();
    await page.keyboard.type("d");
    await expect(page.getByRole("menuitem", { name: "Delete" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(button(page, "Actions")).toBeFocused();
  });

  test("choosing an item runs it and closes the menu", async ({ page, isMobile }) => {
    await button(page, "Actions").click();
    const item = page.getByRole("menuitem", { name: "Edit" });
    if (isMobile) await item.tap();
    else await item.click();
    await expect(page.getByTestId("log")).toHaveText("edit");
    await expect(page.getByRole("menu")).toBeHidden();
  });

  // Radix #1241: opening a Dialog from a modal menu could leave body pointer-events: none behind.
  test("an item that opens a dialog leaves the page clickable afterwards", async ({ page }) => {
    await button(page, "Actions").click();
    await page.getByRole("menuitem", { name: "Open settings" }).click();
    const settings = page.getByRole("dialog", { name: "Settings" });
    await expect(settings).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(settings).toBeHidden();
    await expect.poll(async () => (await bodyStyle(page)).pointerEvents).toBe("auto");
    await button(page, "Actions").click();
    await expect(page.getByRole("menu")).toBeVisible();
  });

  test("passes axe while open", async ({ page }) => {
    await button(page, "Actions").click();
    await expect(page.getByRole("menu")).toBeVisible();
    await expectAccessible(page, { modal: true });
  });
});

test.describe("Popover", () => {
  test("opens, focuses its content, closes on Escape and outside clicks", async ({ page }) => {
    await button(page, "Share").click();
    const field = page.getByRole("textbox", { name: "Link" });
    await expect(field).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(field).toBeHidden();
    await expect(button(page, "Share")).toBeFocused();

    await button(page, "Share").click();
    await expect(field).toBeVisible();
    await page.mouse.click(5, 300);
    await expect(field).toBeHidden();
  });
});

test.describe("Tooltip", () => {
  test("shows on hover and hides when the pointer leaves", async ({ page, isMobile }) => {
    test.skip(isMobile, "Tooltips need hover or focus; touch screens have neither by design");
    await button(page, "Copy").hover();
    await expect(page.getByRole("tooltip")).toHaveText("Copy the link");
    // A real pointer sends many moves; Radix keeps the tooltip open while the pointer is
    // in the corridor towards it, so a single jump would not leave that corridor.
    await page.mouse.move(5, 300, { steps: 10 });
    await expect(page.getByRole("tooltip")).toBeHidden();
  });

  test("shows on keyboard focus, hides on Escape", async ({ page }) => {
    await button(page, "Share").focus();
    await page.keyboard.press("Tab");
    await expect(button(page, "Copy")).toBeFocused();
    await expect(page.getByRole("tooltip")).toHaveText("Copy the link");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toBeHidden();
  });
});

test.describe("HoverCard", () => {
  test("opens after hovering the link and closes after leaving", async ({ page, isMobile }) => {
    test.skip(isMobile, "Hover cards are a hover enhancement; the link itself works on touch");
    await page.getByRole("link", { name: "@Cennge" }).hover();
    await expect(page.getByText("20 repositories")).toBeVisible();
    await page.mouse.move(5, 5);
    await expect(page.getByText("20 repositories")).toBeHidden();
  });

  test("opens on keyboard focus too", async ({ page }) => {
    await page.getByRole("link", { name: "@Cennge" }).focus();
    await expect(page.getByText("20 repositories")).toBeVisible();
  });
});

test.describe("ContextMenu", () => {
  test("opens at the pointer on right click and runs the chosen item", async ({ page, isMobile }) => {
    test.skip(isMobile, "Long-press cannot be held by Playwright on touch");
    const area = page.getByTestId("file-area");
    const box = await area.boundingBox();
    if (!box) throw new Error("no area");
    const x = box.x + 40;
    const y = box.y + 30;
    await page.mouse.click(x, y, { button: "right" });
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    const menuBox = await menu.boundingBox();
    expect(Math.abs((menuBox?.x ?? 0) - x)).toBeLessThan(12);
    await page.getByRole("menuitem", { name: "Rename" }).click();
    await expect(page.getByTestId("log")).toHaveText("rename");
  });
});

test.describe("Drawer", () => {
  test("slides in at the right edge, traps focus, closes on Escape", async ({ page }) => {
    await button(page, "Open drawer").click();
    const drawer = page.getByRole("dialog", { name: "Repository settings" });
    await expect(drawer).toBeVisible();
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("no viewport");
    // Measure after the 300 ms slide-in has finished.
    await expect
      .poll(async () => {
        const box = await drawer.boundingBox();
        return box ? Math.round(box.x + box.width) : -1;
      })
      .toBe(viewport.width);
    expect(await focusIsInside(drawer)).toBe(true);
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(button(page, "Open drawer")).toBeFocused();
  });

  test("passes axe while open", async ({ page }) => {
    await button(page, "Open drawer").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectAccessible(page, { modal: true });
  });
});

test("passes axe with everything closed, in both themes", async ({ page }) => {
  await expectAccessible(page);
  await openFixture(page, "overlays", "light");
  await expectAccessible(page);
});
