import AxeBuilder from "@axe-core/playwright";
import { expect, test as base, type Page } from "@playwright/test";

/**
 * Every test fails if the page logs an error or warning (React key warnings, Radix
 * "missing Title" warnings, uncaught exceptions). Use this `test` instead of Playwright's.
 */
export const test = base.extend<{ consoleGuard: void }>({
  consoleGuard: [
    async ({ page }, use) => {
      const problems: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error" || message.type() === "warning") {
          problems.push(`${message.type()}: ${message.text()}`);
        }
      });
      page.on("pageerror", (error) => problems.push(`uncaught: ${error.message}`));
      await use();
      expect(problems, "the browser console should stay clean").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export type Theme = "dark" | "light";

/** Open playground/fixtures/<name>.tsx on the fixture page. */
export async function openFixture(page: Page, name: string, theme: Theme = "dark") {
  await page.goto(`/fixture.html?name=${name}&theme=${theme}`);
  await expect(page.getByTestId("fixture-ready")).toBeAttached();
}

/**
 * axe-core against WCAG 2.2 A/AA. Reports rule, impact and the first offending nodes.
 *
 * `modal: true` while a modal overlay (Dialog, Drawer, Select, modal menus) is open: Radix hides the
 * rest of the page with aria-hidden and makes it unreachable (focus trap + outside pointer events off).
 * axe still sees focusable elements inside the aria-hidden part and reports aria-hidden-focus, so that
 * one rule is skipped. Specs that pass `modal` must also prove the background is unreachable.
 */
export async function expectAccessible(
  page: Page,
  options: { include?: string; exclude?: string[]; modal?: boolean } = {},
) {
  let builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]);
  if (options.modal) builder = builder.disableRules(["aria-hidden-focus"]);
  if (options.include) builder = builder.include(options.include);
  for (const selector of options.exclude ?? []) builder = builder.exclude(selector);
  const { violations } = await builder.analyze();
  const report = violations.map(
    (v) =>
      `${v.id} [${v.impact}] ${v.help}\n` +
      v.nodes
        .slice(0, 4)
        .map((node) => `    ${node.target.join(" ")} — ${node.failureSummary?.split("\n").slice(1, 2).join(" ").trim()}`)
        .join("\n"),
  );
  expect(report, "axe found accessibility violations").toEqual([]);
}
