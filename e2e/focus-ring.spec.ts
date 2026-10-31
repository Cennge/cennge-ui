import { readdirSync } from "node:fs";
import { expect, openFixture, serveMapTilesOffline, test } from "./test";

/*
 * Every element that Tab reaches must look different while it has keyboard focus (WCAG 2.4.7).
 * axe cannot see this. The check compares what is drawn with and without focus: on the element and
 * its pseudo-elements, a few ancestors (wrappers that draw the ring) and its descendants.
 */
const fixtures = readdirSync(new URL("../playground/fixtures", import.meta.url))
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => file.replace(/\.tsx$/, ""));
/** Fixtures of pictures alone, with no control in them: Tab has nothing to reach. */
const nothingToFocus = new Set(["sparkline"]);

declare global {
  interface Window {
    /** What is drawn around an element: only styles that are actually visible. */
    __focusLook: (element: Element) => string;
    /** What cuts off the focus ring of an element, if anything. */
    __focusCut: (element: Element) => string | null;
  }
}

test.describe("keyboard focus is visible", () => {
  test.skip(({ isMobile }) => isMobile, "phones have no Tab key");

  // Each fixture, then the whole playground for components without a fixture of their own.
  for (const name of [...fixtures, "playground"]) {
    test(name, async ({ page }) => {
      test.skip(nothingToFocus.has(name), "nothing in it takes focus");
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
        // Where the ring is drawn (the element or a wrapper with focus-within styles) and what cuts it.
        window.__focusCut = (element) => {
          let holder: Element | null = null;
          let reach = 0;
          for (let node: Element | null = element, depth = 0; node && depth < 3; node = node.parentElement, depth++) {
            const style = getComputedStyle(node);
            const outline = style.outlineStyle !== "none" ? parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset) : 0;
            const lengths = Array.from(style.boxShadow.matchAll(/(-?\d+(?:\.\d+)?)px/g), (m) => Number(m[1]));
            const ring = style.boxShadow === "none" ? 0 : Math.max(0, ...lengths.filter((_, i) => i % 4 === 3));
            if (Math.max(outline, ring) > 0) {
              holder = node;
              reach = Math.max(outline, ring);
              break;
            }
          }
          if (!holder) return null;
          const box = holder.getBoundingClientRect();
          for (let node = holder.parentElement; node && node !== document.documentElement; node = node.parentElement) {
            const style = getComputedStyle(node);
            const [x, y] = [style.overflowX !== "visible", style.overflowY !== "visible"];
            if (!x && !y) continue;
            const r = node.getBoundingClientRect();
            const inner = {
              left: r.left + parseFloat(style.borderLeftWidth),
              right: r.right - parseFloat(style.borderRightWidth),
              top: r.top + parseFloat(style.borderTopWidth),
              bottom: r.bottom - parseFloat(style.borderBottomWidth),
            };
            const sides = [
              x && box.left - reach < inner.left - 0.5 ? "left" : "",
              x && box.right + reach > inner.right + 0.5 ? "right" : "",
              y && box.top - reach < inner.top - 0.5 ? "top" : "",
              y && box.bottom + reach > inner.bottom + 0.5 ? "bottom" : "",
            ].filter(Boolean);
            if (sides.length) return `${node.tagName.toLowerCase()} with overflow ${style.overflowX}/${style.overflowY} cuts ${sides.join(", ")}`;
          }
          return null;
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
        await serveMapTilesOffline(page);
        await page.goto("/");
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 30_000 });
      } else {
        await openFixture(page, name);
      }
      // A map's markers and controls appear once MapLibre has drawn it.
      await expect(page.locator('[data-slot="map"][data-state="loading"]')).toHaveCount(0, { timeout: 20_000 });
      // The settled look only: no transitions or animations half-way.
      await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" });

      const invisible: string[] = [];
      const clipped: string[] = [];
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
          const cut = window.__focusCut(active);
          // Blur, look again, and give focus back so Tab goes on from here.
          active.blur();
          const blurred = window.__focusLook(active);
          active.focus({ preventScroll: true });
          return {
            key: path.join("."),
            name: `${active.tagName.toLowerCase()}${role ? `[role=${role}]` : ""} "${label}"`,
            same: focused === blurred,
            cut,
          };
        });
        if (!result || seen.has(result.key)) break; // left the page, or came round again
        seen.add(result.key);
        if (result.same) invisible.push(result.name);
        if (result.cut) clipped.push(`${result.name}: ${result.cut}`);
      }
      expect(seen.size, "Tab reached something").toBeGreaterThan(0);
      expect(invisible, "elements that look the same with and without keyboard focus").toEqual([]);
      expect(clipped, "focus rings cut off by a parent that clips its overflow").toEqual([]);
    });
  }
});
