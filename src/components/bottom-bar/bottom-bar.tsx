import * as React from "react";
import { tv } from "../../utils/tv";
import { bottomSafe, useBottomStack } from "../../utils/use-bottom-stack";

const bar = tv({
  base: "z-30 flex w-full items-center gap-3 border-t border-border bg-surface-2/95 px-4 pt-3 backdrop-blur-md",
  variants: {
    position: {
      fixed: "fixed inset-x-0",
      sticky: "sticky",
      static: "relative",
    },
  },
});

export interface BottomBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * "fixed" pins it to the bottom of the screen, above a fixed BottomNavigation; "sticky" keeps it at the
   * bottom of its scroll container; "static" leaves it in the flow. @default "fixed"
   */
  position?: "fixed" | "sticky" | "static";
}

/**
 * A bar at the bottom of the screen for the action a screen is for, in reach of a thumb: "Log set",
 * "Add to breakfast", or a strip with the session running. It never moves while you work, pads for the
 * home indicator unless a BottomNavigation under it does, and writes its height to `--cennge-bottom-bar`.
 */
export const BottomBar = React.forwardRef<HTMLDivElement, BottomBarProps>(function BottomBar(
  { position = "fixed", className, style, ...rest },
  forwardedRef,
) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement);
  useBottomStack("bar", ref, position === "fixed");
  return (
    <div
      ref={ref}
      data-slot="bottom-bar"
      className={bar({ position, className })}
      style={{
        bottom: position === "static" ? undefined : "var(--cennge-bottom-nav, 0px)",
        paddingBottom: position === "static" ? "0.75rem" : `calc(0.75rem + ${bottomSafe})`,
        ...style,
      }}
      {...rest}
    />
  );
});
