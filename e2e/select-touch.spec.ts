import { expect, expectAccessible, openFixture, test } from "./test";

/*
 * Radix #1658: a tap on a Select option also pressed what was under the list. The list closed on the
 * touch's end, and the click a browser sends after a tap went to whatever was left there. Radix Select now
 * picks on that click instead (fixed in 2.1.2, back in 2.1.x, fixed again by 2.2.2); this keeps it so.
 */

test.beforeEach(async ({ page }) => {
  await openFixture(page, "select-touch");
});

test("a tap or click on an option over a button picks it and does not press the button", async ({ page, isMobile }) => {
  // Without motion the list leaves at once: no closing animation keeps it there to catch a stray click.
  await page.emulateMedia({ reducedMotion: "reduce" });
  const trigger = page.getByRole("combobox", { name: "Region" });
  if (isMobile) await trigger.tap();
  else await trigger.click();
  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();

  // The option lying over the middle of the first button.
  const target = (await page.getByRole("button", { name: "Delete deployment", includeHidden: true }).boundingBox())!;
  const [x, y] = [target.x + target.width / 2, target.y + target.height / 2];
  const under = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('[role="option"]')?.textContent ?? null, [x, y] as const);
  expect(under, "the list should cover the button").not.toBeNull();

  if (isMobile) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
  await expect(listbox).toBeHidden();
  await expect(page.getByTestId("result")).toHaveText(`region ${under}, deletes 0`);
  // The click a browser sends after a tap comes up to ~300 ms late: give one that must not come that time.
  await page.waitForTimeout(500);
  await expect(page.getByTestId("result")).toHaveText(`region ${under}, deletes 0`);
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe with the list open in the ${theme} theme`, async ({ page, isMobile }) => {
    await openFixture(page, "select-touch", theme);
    const trigger = page.getByRole("combobox", { name: "Region" });
    if (isMobile) await trigger.tap();
    else await trigger.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await expectAccessible(page, { modal: true });
  });
}
