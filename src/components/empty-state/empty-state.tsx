import * as React from "react";
import { tv } from "../../utils/tv";

const emptyState = tv({
  slots: {
    base: "flex w-full flex-col items-center justify-center text-center",
    icon: "flex items-center justify-center rounded-large bg-surface-3 text-muted inset-shadow-tactile shadow-raised",
    title: "font-semibold text-foreground",
    description: "max-w-sm text-muted",
    actions: "mt-2 flex flex-wrap items-center justify-center gap-2",
  },
  variants: {
    variant: {
      plain: {},
      bordered: { base: "rounded-large border-2 border-dashed border-border" },
    },
    size: {
      sm: { base: "gap-2 px-4 py-6", icon: "size-10 [&_svg]:size-5", title: "text-sm", description: "text-xs" },
      md: { base: "gap-3 px-6 py-10", icon: "size-12 [&_svg]:size-6", title: "text-base", description: "text-sm" },
    },
  },
  defaultVariants: { variant: "plain", size: "md" },
});

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Buttons that get the user out of the empty state, e.g. "Create issue". */
  actions?: React.ReactNode;
  /** @default "plain" */
  variant?: "plain" | "bordered";
  /** @default "md" */
  size?: "sm" | "md";
}

/** What to show when a list, search or page has nothing in it yet. */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { icon, title, description, actions, variant = "plain", size = "md", className, children, ...rest },
  ref,
) {
  const slots = emptyState({ variant, size });
  return (
    <div ref={ref} className={slots.base({ class: className })} {...rest}>
      {icon ? (
        <div aria-hidden="true" className={slots.icon()}>
          {icon}
        </div>
      ) : null}
      <p className={slots.title()}>{title}</p>
      {description ? <p className={slots.description()}>{description}</p> : null}
      {children}
      {actions ? <div className={slots.actions()}>{actions}</div> : null}
    </div>
  );
});
