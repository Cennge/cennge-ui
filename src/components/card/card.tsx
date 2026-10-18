import * as React from "react";
import { Slot } from "radix-ui";
import { tv } from "../../utils/tv";
import { cn } from "../../utils/cn";
import { useCenngeDefaults } from "../../provider";
import type { CenngeRadius } from "../../types";

export type CardVariant = "raised" | "bordered" | "flat";

const card = tv({
  base: "relative flex flex-col overflow-hidden text-foreground",
  variants: {
    variant: {
      // Depth from the surface layer first, the shadow only supports it.
      // surface-3 reads as raised both on the page (surface-1) and inside a panel (surface-2).
      raised: "bg-surface-3 shadow-raised",
      bordered: "border border-border bg-surface-3",
      flat: "bg-surface-3",
    },
    radius: {
      none: "rounded-none",
      sm: "rounded-small",
      md: "rounded-medium",
      lg: "rounded-large",
      full: "rounded-[1.5rem]",
    },
    isPressable: {
      true: [
        "cursor-pointer text-left outline-none select-none",
        "transition-[transform,background-color,box-shadow] duration-(--cennge-duration) ease-tactile motion-reduce:transition-none",
        "hover:bg-surface-4 active:scale-[0.985]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      ],
    },
    fullWidth: { true: "w-full" },
  },
  defaultVariants: { variant: "raised", radius: "lg", isPressable: false, fullWidth: false },
});

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "raised" */
  variant?: CardVariant;
  /** @default "lg" */
  radius?: CenngeRadius;
  /** Hover and press feedback. Combine with `asChild` and an `<a>` or `<button>` so it is focusable. */
  isPressable?: boolean;
  fullWidth?: boolean;
  /** Render the child element (a link, a button) as the card. */
  asChild?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(props, ref) {
  const defaults = useCenngeDefaults();
  const {
    variant = "raised",
    radius = defaults.radius ?? "lg",
    isPressable = false,
    fullWidth = false,
    asChild = false,
    className,
    ...rest
  } = props;
  const Comp = asChild ? Slot.Root : "div";
  return <Comp ref={ref} className={card({ variant, radius, isPressable, fullWidth, className })} {...rest} />;
});

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("flex items-center gap-3 px-5 pt-5", className)} {...rest} />;
  },
);

export const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardBody({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("flex flex-1 flex-col gap-2 px-5 py-4", className)} {...rest} />;
  },
);

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("flex items-center gap-2 px-5 pb-5", className)} {...rest} />;
  },
);
