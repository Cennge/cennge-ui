import { readdirSync } from "node:fs";
import { expect, openFixture, test } from "./test";

/*
 * Every element that Tab reaches must look different while it has keyboard focus (WCAG 2.4.7).
 * axe cannot see this. The check compares what is drawn with and without focus: on the element and
 * its pseudo-elements, a few ancestors (wrappers that draw the ring) and its descendants.
 */
const fixtures = readdirSync(new URL("../playground/fixtures", import.meta.url))
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => file.replace(/\.tsx$/, ""));

declare global {
  interface Window {
    /** What is drawn around an element: only styles that are actually visible. */
    __focusLook: (element: Element) => string;
  }
}

test.describe("keyboard focus is visible", () => {
  test.skip(({ isMobile }) => isMobile, "phones have no Tab key");

  // Each fixture, then the whole playground for components without a fixture of their own.
  for (const name of [...fixtures, "playground"]) {
    test(name, async ({ page }) => {
      await page.addInitScript(() => {
        const drawn = (style: CSSStyleDeclaration) => {
          // An outline or border with style none draws nothing, whatever its width and colour say.
          const outline =
            style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0
              ? `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor} ${style.outlineOffset}`
              : "none";
          const border = (["Top", "Right", "Bottom", "Left"] as const)
            .map((side) =>
              style.getPropertyValue(`border-${side.toLowerCase()}-style`) !== "none" &&
              parseFloat(style.getPropertyValue(`border-${side.toLowerCase()}-width`)) > 0
                ? style.getPropertyValue(`border-${side.toLowerCase()}-color`)
                : "none",
            )
            .join(" ");
          return [outline, border, style.boxShadow, style.backgroundColor, style.color, style.textDecorationLine].join("|");
        };
        window.__focusLook = (element) => {
          const nodes: Element[] = [element];
          for (let node = element.parentElement, i = 0; node && i < 3; node = node.parentElement, i++) nodes.push(node);
          nodes.push(...Array.from(element.querySelectorAll("*")).slice(0, 40));
          return nodes
            .flatMap((node) => [drawn(getComputedStyle(node)), drawn(getComputedStyle(node, "::before")), drawn(getComputedStyle(node, "::after"))])
            .join("\n");
        };
      });
      if (name === "playground") {
        test.setTimeout(120_000); // some 250 tab stops; WebKit under a full parallel run needs the time
        await page.goto("/");
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 30_000 });
      } else {
        await openFixture(page, name);
      }
      // The settled look only: no transitions or animations half-way.
      await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" });

      const invisible: string[] = [];
      const seen = new Set<string>();
      for (let i = 0; i < (name === "playground" ? 600 : 80); i++) {
        await page.keyboard.press("Tab");
        const result = await page.evaluate(() => {
          const active = document.activeElement as HTMLElement | null;
          if (!active || active === document.body) return null;
          const path: number[] = [];
          for (let node: Element = active; node.parentElement; node = node.parentElement) {
            path.unshift(Array.prototype.indexOf.call(node.parentElement.children, node));
          }
          const label = (active.getAttribute("aria-label") ?? active.textContent ?? "").trim().slice(0, 40);
          const role = active.getAttribute("role");
          const focused = window.__focusLook(active);
          // Blur, look again, and give focus back so Tab goes on from here.
          active.blur();
          const blurred = window.__focusLook(active);
          active.focus({ preventScroll: true });
          return {
            key: path.join("."),
            name: `${active.tagName.toLowerCase()}${role ? `[role=${role}]` : ""} "${label}"`,
            same: focused === blurred,
          };
        });
        if (!result || seen.has(result.key)) break; // left the page, or came round again
        seen.add(result.key);
        if (result.same) invisible.push(result.name);
      }
      expect(seen.size, "Tab reached something").toBeGreaterThan(0);
      expect(invisible, "elements that look the same with and without keyboard focus").toEqual([]);
    });
  }
});
