import * as React from "react";
import { Separator as SeparatorPrimitive } from "radix-ui";
import { cn } from "../../utils/cn";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /**
   * Purely visual: hidden from screen readers. Turn off when the line separates
   * meaningful groups of content. @default true
   */
  isDecorative?: boolean;
  /** Text in the middle of a horizontal line, e.g. "or". */
  children?: React.ReactNode;
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { orientation = "horizontal", isDecorative = true, className, children, ...rest },
  ref,
) {
  if (children && orientation === "horizontal") {
    return (
      <SeparatorPrimitive.Root
        ref={ref}
        orientation="horizontal"
        decorative={isDecorative}
        className={cn("flex w-full items-center gap-3 text-xs font-medium text-muted", className)}
        {...rest}
      >
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        {children}
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </SeparatorPrimitive.Root>
    );
  }

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      orientation={orientation}
      decorative={isDecorative}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch",
        className,
      )}
      {...rest}
    />
  );
});
