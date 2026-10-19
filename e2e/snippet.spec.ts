import { expect, expectAccessible, openFixture, test } from "./test";
import type { Page } from "@playwright/test";

declare global {
  interface Window {
    /** Every text the page copied, and how: the Clipboard API or the execCommand fallback. */
    copies: { via: "clipboard" | "execCommand"; text: string }[];
  }
}

/* Records copies without reading the system clipboard, which Firefox and WebKit keep from scripts. */
async function recordCopies(page: Page, { withoutClipboardApi = false } = {}) {
  await page.addInitScript((removeApi) => {
    window.copies = [];
    if (removeApi) {
      // As on plain http: the Clipboard API only exists in secure contexts.
      Object.defineProperty(Navigator.prototype, "clipboard", { get: () => undefined, configurable: true });
    } else if (navigator.clipboard) {
      const write = navigator.clipboard.writeText.bind(navigator.clipboard);
      navigator.clipboard.writeText = (text: string) =>
        write(text).then(() => void window.copies.push({ via: "clipboard", text }));
    }
    document.addEventListener("copy", () => {
      const field = document.activeElement as HTMLTextAreaElement | null;
      const text = field?.value?.slice(field.selectionStart ?? 0, field.selectionEnd ?? 0) ?? "";
      window.copies.push({ via: "execCommand", text });
    });
  }, withoutClipboardApi);
}

const copies = (page: Page) => page.evaluate(() => window.copies.map((copy) => copy.text));
const copyIn = (page: Page, testId: string) => page.getByTestId(testId).getByRole("button", { name: "Copy" });

test("copies the command without the symbol, shows a check and announces it", async ({ page, isMobile, browserName, context }) => {
  await recordCopies(page);
  await openFixture(page, "snippet");
  const button = copyIn(page, "install");
  await expect(button).toHaveAccessibleDescription("pnpm add cennge-ui");
  if (isMobile) await button.tap();
  else await button.click();
  await expect(button).toHaveAttribute("data-copied", "true");
  await expect(page.getByTestId("install").locator('[aria-live="polite"]')).toHaveText("Copied");
  await expect.poll(() => copies(page)).toEqual(["pnpm add cennge-ui"]);
  await expect(button).not.toHaveAttribute("data-copied", { timeout: 4000 });

  if (browserName === "chromium") {
    // Chromium lets a test read the system clipboard: the text really arrived there.
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("pnpm add cennge-ui");
  }
});

test("copies every line of a multi-line command", async ({ page }) => {
  await recordCopies(page);
  await openFixture(page, "snippet");
  await copyIn(page, "clone").click();
  await expect
    .poll(() => copies(page))
    .toEqual(["git clone https://github.com/Cennge/ai-niche-scout.git\ncd ai-niche-scout"]);
});

test("keyboard: Enter on the copy button copies and keeps focus there", async ({ page }) => {
  await recordCopies(page);
  await openFixture(page, "snippet");
  const button = copyIn(page, "install");
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(button).toHaveAttribute("data-copied", "true");
  await expect(button).toBeFocused();
});

test("a long command scrolls sideways and takes focus so the keyboard can scroll it", async ({ page }) => {
  await openFixture(page, "snippet");
  const longCode = page.getByTestId("long").locator("pre");
  await expect(longCode).toHaveAttribute("tabindex", "0");
  await expect(page.getByTestId("install").locator("pre")).not.toHaveAttribute("tabindex");
  await longCode.focus();
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
  await expect.poll(() => longCode.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
});

test("without the Clipboard API (plain http) the fallback copies, even inside a dialog", async ({ page }) => {
  await recordCopies(page, { withoutClipboardApi: true });
  await openFixture(page, "snippet");
  await page.getByRole("button", { name: "Deploy instructions" }).click();
  const dialog = page.getByRole("dialog", { name: "Deploy" });
  const button = dialog.getByRole("button", { name: "Copy" });
  await button.click();
  await expect(button).toHaveAttribute("data-copied", "true");
  await expect.poll(() => copies(page)).toEqual(["docker compose up -d"]);
  await expect(dialog).toBeVisible();
  await expect(button).toBeFocused();
  await expect(dialog.locator("textarea")).toHaveCount(0);
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme, also right after copying`, async ({ page }) => {
    await recordCopies(page);
    await openFixture(page, "snippet", theme);
    await expectAccessible(page);
    await copyIn(page, "install").click();
    await expect(copyIn(page, "install")).toHaveAttribute("data-copied", "true");
    await expectAccessible(page);
  });
}
