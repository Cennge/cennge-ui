import { expect, expectAccessible, openFixture, test } from "./test";
import type { Page } from "@playwright/test";

// A valid 1×1 PNG, so the preview really decodes.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);
const png = (name: string) => ({ name, mimeType: "image/png", buffer: PNG });
const pdf = (name: string) => ({ name, mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n") });

const zone = (page: Page, name = "Attachments") => page.getByRole("button", { name, exact: true });
const files = (page: Page) => page.getByTestId("files");

test.beforeEach(async ({ page }) => {
  await openFixture(page, "file-upload");
});

test("clicking or tapping the dropzone opens the native file picker", async ({ page, isMobile }) => {
  const chooser = page.waitForEvent("filechooser");
  if (isMobile) await zone(page).tap();
  else await zone(page).click();
  const picker = await chooser;
  expect(picker.isMultiple()).toBe(true);
  await picker.setFiles([png("cat.png"), pdf("spec.pdf")]);
  await expect(files(page)).toHaveText("cat.png|spec.pdf");
});

test("Enter on the focused dropzone opens the picker too", async ({ page }) => {
  await zone(page).focus();
  const chooser = page.waitForEvent("filechooser");
  await page.keyboard.press("Enter");
  await (await chooser).setFiles([png("cat.png")]);
  await expect(files(page)).toHaveText("cat.png");
});

test("refuses wrong types, large files and extras, and says why", async ({ page }) => {
  const chooser = page.waitForEvent("filechooser");
  await zone(page).click();
  await (await chooser).setFiles([
    png("a.png"),
    { name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("hello") },
    { name: "huge.png", mimeType: "image/png", buffer: Buffer.alloc(1024 * 1024 + 1) },
    png("b.png"),
    png("c.png"),
    png("d.png"),
  ]);
  await expect(files(page)).toHaveText("a.png|b.png|c.png");
  await expect(page.getByTestId("rejected")).toHaveText(
    "notes.txt:file-invalid-type,huge.png:file-too-large,d.png:too-many-files",
  );
  const alert = page.getByRole("alert").first();
  await expect(alert).toContainText("notes.txt: this file type is not accepted");
  await expect(alert).toContainText("huge.png is larger than 1 MB");
  await expect(alert).toContainText("d.png was not added: up to 3 files");
});

test("drag and drop: highlight while dragging (nested elements included), add on drop", async ({ page }) => {
  const transfer = await page.evaluateHandle(() => {
    const data = new DataTransfer();
    data.items.add(new File(["%PDF-1.4"], "dropped.pdf", { type: "application/pdf" }));
    return data;
  });
  const root = zone(page).locator("xpath=..");
  const inner = zone(page).locator("span").first();

  await zone(page).dispatchEvent("dragenter", { dataTransfer: transfer });
  await inner.dispatchEvent("dragenter", { dataTransfer: transfer });
  await expect(root).toHaveAttribute("data-dragging", "true");
  await expect(zone(page)).toContainText("Drop to add");
  // Leaving the outer element while still over a child must not end the drag state.
  await zone(page).dispatchEvent("dragleave", { dataTransfer: transfer });
  await expect(root).toHaveAttribute("data-dragging", "true");
  await inner.dispatchEvent("dragleave", { dataTransfer: transfer });
  await expect(root).not.toHaveAttribute("data-dragging");

  await zone(page).dispatchEvent("dragenter", { dataTransfer: transfer });
  await zone(page).dispatchEvent("dragover", { dataTransfer: transfer });
  await zone(page).dispatchEvent("drop", { dataTransfer: transfer });
  await expect(files(page)).toHaveText("dropped.pdf");
  await expect(root).not.toHaveAttribute("data-dragging");
});

test("image previews decode, and their blob URLs are released on removal", async ({ page }) => {
  // Record revocations instead of fetching the URL (a failed fetch would log a console error).
  await page.evaluate(() => {
    const revoked: string[] = [];
    const original = URL.revokeObjectURL.bind(URL);
    URL.revokeObjectURL = (url: string) => {
      revoked.push(url);
      original(url);
    };
    (window as unknown as { __revoked: string[] }).__revoked = revoked;
  });
  const chooser = page.waitForEvent("filechooser");
  await zone(page).click();
  await (await chooser).setFiles([png("cat.png")]);
  const preview = page.getByRole("list", { name: "Selected files" }).locator("img");
  await expect(preview).toHaveAttribute("src", /^blob:/);
  await expect.poll(() => preview.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1);
  const url = await preview.getAttribute("src");

  await page.getByRole("button", { name: "Remove cat.png" }).click();
  await expect(files(page)).toHaveText("");
  const revoked = await page.evaluate(() => (window as unknown as { __revoked: string[] }).__revoked);
  expect(revoked).toContain(url);
});

test("removing moves focus to the next file, then back to the dropzone", async ({ page }) => {
  const chooser = page.waitForEvent("filechooser");
  await zone(page).click();
  await (await chooser).setFiles([png("a.png"), png("b.png")]);
  await page.getByRole("button", { name: "Remove a.png" }).click();
  await expect(page.getByRole("button", { name: "Remove b.png" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(files(page)).toHaveText("");
  await expect(zone(page)).toBeFocused();
});

test("a plain form submit sends exactly the listed files", async ({ page }) => {
  const input = page.locator('input[type="file"][name="docs"]');
  await input.setInputFiles([pdf("one.pdf"), pdf("two.pdf")]);
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByTestId("submitted")).toHaveText('["one.pdf","two.pdf"]');
  await page.getByRole("button", { name: "Remove one.pdf" }).click();
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByTestId("submitted")).toHaveText('["two.pdf"]');
});

test("disabled: no picker, drops ignored", async ({ page }) => {
  const locked = zone(page, "Locked");
  await expect(locked).toBeDisabled();
  const transfer = await page.evaluateHandle(() => {
    const data = new DataTransfer();
    data.items.add(new File(["x"], "x.pdf", { type: "application/pdf" }));
    return data;
  });
  await locked.locator("xpath=..").dispatchEvent("drop", { dataTransfer: transfer });
  await expect(locked.locator("xpath=..").getByRole("list")).toHaveCount(0);
});

test("long file names stay inside the row on small screens", async ({ page }) => {
  const chooser = page.waitForEvent("filechooser");
  await zone(page).click();
  await (await chooser).setFiles([pdf(`${"quarterly-report-final-v2-".repeat(4)}.pdf`)]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme, with files and errors shown`, async ({ page }) => {
    await openFixture(page, "file-upload", theme);
    const chooser = page.waitForEvent("filechooser");
    await zone(page).click();
    await (await chooser).setFiles([png("cat.png"), { name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("x") }]);
    await expect(files(page)).toHaveText("cat.png");
    await expectAccessible(page);
  });
}
