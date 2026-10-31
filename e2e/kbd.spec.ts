import { expect, expectAccessible, openFixture, test } from "./test";

test.beforeEach(async ({ page }) => {
  await openFixture(page, "kbd");
});

// The symbols were text: in Inter, ⌘ ⇧ ↵ and the arrows came out about 5px tall in a 12px key cap.
test("a drawn key fills its cap, in the middle, at both sizes", async ({ page }) => {
  for (const [size, least] of [["md", 14], ["sm", 12]] as const) {
    const caps = page.getByTestId(size).locator("kbd");
    await expect(caps).toHaveCount(15);
    const checks = await caps.evaluateAll((kbds) =>
      kbds.flatMap((kbd) => {
        const icon = kbd.querySelector("svg");
        if (!icon) return [];
        const cap = kbd.getBoundingClientRect();
        const box = icon.getBoundingClientRect();
        return [{
          key: kbd.querySelector("abbr")!.title,
          size: Math.round(box.height),
          off: Math.max(Math.abs(box.top + box.height / 2 - (cap.top + cap.height / 2)), Math.abs(box.left + box.width / 2 - (cap.left + cap.width / 2))),
        }];
      }),
    );
    // Ctrl, Alt, Esc and Space are words; the other eleven are drawn.
    expect(checks).toHaveLength(11);
    for (const check of checks) {
      expect(check.size, `${check.key} (${size})`).toBeGreaterThanOrEqual(least);
      expect(check.off, `${check.key} (${size}) off centre`).toBeLessThan(1.5);
    }
  }
});

test("every key keeps its name: spoken in full, and on hover", async ({ page }) => {
  await expect(page.getByText("Search the repository").locator("kbd")).toHaveText("Command K");
  await expect(page.getByText("New line in a comment").locator("kbd")).toHaveText("Shift Enter");
  await expect(page.getByTestId("md").locator("abbr[title=Escape]")).toHaveText("Esc");
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "kbd", theme);
    await expectAccessible(page);
  });
}
