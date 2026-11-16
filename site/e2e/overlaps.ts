import type { Page } from "@playwright/test";

/**
 * Text drawn over other text on the page: each visible run of text, cut to what its ancestors let show,
 * against every other one. A run hidden for screen readers only (sr-only) shows nothing and is skipped;
 * a table's caption is not clipped by its table, which is how a chart's hidden caption once showed.
 */
export function findOverlaps(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    type Box = { left: number; top: number; right: number; bottom: number };
    const visible = (node: Element, rect: DOMRect): Box | null => {
      let { left, top, right, bottom } = rect;
      for (let el: Element | null = node, child: Element | null = null; el; child = el, el = el.parentElement) {
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return null;
        // A table's overflow and clip do not reach its caption.
        const reaches = !(el.tagName === "TABLE" && child?.tagName === "CAPTION");
        if (!reaches || (style.overflow === "visible" && style.clipPath === "none" && style.clip === "auto")) continue;
        if (style.clipPath.includes("inset(50%")) return null;
        const box = el.getBoundingClientRect();
        left = Math.max(left, box.left);
        top = Math.max(top, box.top);
        right = Math.min(right, box.right);
        bottom = Math.min(bottom, box.bottom);
        if (right - left < 2 || bottom - top < 2) return null;
      }
      return { left, top, right, bottom };
    };
    const runs: { box: Box; text: string; el: Element }[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let text = walker.nextNode(); text; text = walker.nextNode()) {
      const el = text.parentElement;
      // Code is laid out by its own block; chart tooltips float over the plot on purpose.
      if (!text.textContent?.trim() || !el || el.closest("pre, code, svg, [data-slot=chart-tooltip]")) continue;
      const range = document.createRange();
      range.selectNodeContents(text);
      for (const rect of range.getClientRects()) {
        if (rect.width < 2 || rect.height < 2) continue;
        const box = visible(el, rect);
        if (box) runs.push({ box, text: text.textContent.trim().slice(0, 40), el });
      }
    }
    const hits: string[] = [];
    for (let i = 0; i < runs.length; i++) {
      for (let j = i + 1; j < runs.length; j++) {
        const [a, b] = [runs[i]!, runs[j]!];
        if (a.el === b.el) continue;
        const width = Math.min(a.box.right, b.box.right) - Math.max(a.box.left, b.box.left);
        const height = Math.min(a.box.bottom, b.box.bottom) - Math.max(a.box.top, b.box.top);
        // More than a sliver: 4px across and a third of the shorter line's height.
        if (width > 4 && height > Math.min(a.box.bottom - a.box.top, b.box.bottom - b.box.top) / 3) hits.push(`"${a.text}" over "${b.text}"`);
      }
    }
    return hits;
  });
}
