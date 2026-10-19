import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "../../utils/cn";
import { useCenngeDefaults } from "../../provider";
import type { CenngeSize } from "../../types";

const sizes: Record<CenngeSize, string> = {
  sm: "cennge-prose cennge-prose-sm",
  md: "cennge-prose",
  lg: "cennge-prose cennge-prose-lg",
};

export interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Text size; spacing follows it. @default "md" */
  size?: CenngeSize;
  /** Style your own element instead of a div, e.g. `<article>`. */
  asChild?: boolean;
}

/**
 * Styles rendered HTML: Markdown, MDX or a CMS. Headings, lists, links, quotes, code, tables and images
 * get the theme's colours. The styles are the `cennge-prose` class from `cennge-ui/styles.css`, in the
 * `components` layer, so a utility on any element inside wins, and `not-prose` switches them off.
 */
export const Prose = React.forwardRef<HTMLDivElement, ProseProps>(function Prose(
  { size, asChild = false, className, ...rest },
  forwardedRef,
) {
  const defaults = useCenngeDefaults();
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement);

  // A code block with lines longer than the column scrolls sideways; let the keyboard reach it.
  React.useEffect(() => {
    const root = ref.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const update = () => {
      for (const pre of Array.from(root.querySelectorAll<HTMLElement>("pre"))) {
        if (pre.closest(".not-prose")) continue;
        const scrolls = pre.scrollWidth > pre.clientWidth + 1;
        if (scrolls && !pre.hasAttribute("tabindex")) {
          pre.tabIndex = 0;
          pre.dataset.prosePre = "";
        } else if (!scrolls && pre.dataset.prosePre !== undefined) {
          pre.removeAttribute("tabindex");
          delete pre.dataset.prosePre;
        }
      }
    };
    update();
    const resize = new ResizeObserver(update);
    resize.observe(root);
    const mutation = new MutationObserver(update);
    mutation.observe(root, { childList: true, subtree: true, characterData: true });
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, []);

  const Comp = asChild ? Slot.Root : "div";
  return <Comp ref={ref} className={cn(sizes[size ?? defaults.size ?? "md"], className)} {...rest} />;
});
