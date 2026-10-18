import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { tv } from "../../utils/tv";
import { cn } from "../../utils/cn";
import type { CenngeColor, CenngeSize } from "../../types";

export type TabsVariant = "solid" | "underlined" | "light";

interface TabsStyle {
  variant: TabsVariant;
  color: CenngeColor;
  size: CenngeSize;
  fullWidth: boolean;
}

const TabsStyleContext = React.createContext<TabsStyle>({
  variant: "solid",
  color: "default",
  size: "md",
  fullWidth: false,
});

const list = tv({
  base: "inline-flex items-center",
  variants: {
    variant: {
      solid: "gap-1 rounded-medium bg-surface-2 p-1 inset-shadow-[inset_0_1px_2px_rgb(0_0_0/0.18)]",
      underlined: "gap-4 border-b border-border",
      light: "gap-1",
    },
    fullWidth: { true: "flex w-full" },
  },
});

/* Selected-state colours. Literal per colour so Tailwind finds them. */
const selected: Record<TabsVariant, Record<CenngeColor, string>> = {
  solid: {
    default: "data-[state=active]:bg-surface-4 data-[state=active]:text-foreground",
    primary: "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
    secondary: "data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground",
    success: "data-[state=active]:bg-success data-[state=active]:text-success-foreground",
    warning: "data-[state=active]:bg-warning data-[state=active]:text-warning-foreground",
    danger: "data-[state=active]:bg-danger data-[state=active]:text-danger-foreground",
    info: "data-[state=active]:bg-info data-[state=active]:text-info-foreground",
  },
  underlined: {
    default: "data-[state=active]:border-foreground data-[state=active]:text-foreground",
    primary: "data-[state=active]:border-primary data-[state=active]:text-primary-text",
    secondary: "data-[state=active]:border-secondary data-[state=active]:text-secondary-text",
    success: "data-[state=active]:border-success data-[state=active]:text-success-text",
    warning: "data-[state=active]:border-warning data-[state=active]:text-warning-text",
    danger: "data-[state=active]:border-danger data-[state=active]:text-danger-text",
    info: "data-[state=active]:border-info data-[state=active]:text-info-text",
  },
  light: {
    default: "data-[state=active]:bg-default-bg data-[state=active]:text-foreground",
    primary: "data-[state=active]:bg-primary-bg data-[state=active]:text-primary-text",
    secondary: "data-[state=active]:bg-secondary-bg data-[state=active]:text-secondary-text",
    success: "data-[state=active]:bg-success-bg data-[state=active]:text-success-text",
    warning: "data-[state=active]:bg-warning-bg data-[state=active]:text-warning-text",
    danger: "data-[state=active]:bg-danger-bg data-[state=active]:text-danger-text",
    info: "data-[state=active]:bg-info-bg data-[state=active]:text-info-text",
  },
};

const trigger = tv({
  base: [
    "inline-flex cursor-pointer items-center justify-center gap-2 font-semibold whitespace-nowrap text-muted",
    "transition-[color,background-color,border-color,box-shadow] duration-(--cennge-duration-fast) ease-tactile motion-reduce:transition-none",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "hover:text-foreground disabled:pointer-events-none disabled:opacity-(--cennge-disabled-opacity)",
  ],
  variants: {
    variant: {
      solid: "rounded-small data-[state=active]:inset-shadow-tactile data-[state=active]:shadow-raised",
      underlined: "-mb-px border-b-2 border-transparent",
      light: "rounded-small",
    },
    size: {
      sm: "h-7 px-2.5 text-xs",
      md: "h-8 px-3 text-sm",
      lg: "h-10 px-4 text-base",
    },
    fullWidth: { true: "flex-1" },
  },
  compoundVariants: [
    { variant: "underlined", class: "px-1" },
    { variant: "underlined", size: "sm", class: "h-8" },
    { variant: "underlined", size: "md", class: "h-10" },
    { variant: "underlined", size: "lg", class: "h-12" },
  ],
});

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** @default "solid" */
  variant?: TabsVariant;
  /** Colour of the selected tab. @default "default" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  /** Stretch the tab list to the full width. */
  fullWidth?: boolean;
  /** @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  className?: string;
  children?: React.ReactNode;
}

export function Tabs({
  variant = "solid",
  color = "default",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...rest
}: TabsProps) {
  const style = React.useMemo(() => ({ variant, color, size, fullWidth }), [variant, color, size, fullWidth]);
  return (
    <TabsStyleContext.Provider value={style}>
      <TabsPrimitive.Root className={cn("flex flex-col gap-4", className)} {...rest}>
        {children}
      </TabsPrimitive.Root>
    </TabsStyleContext.Provider>
  );
}

export const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function TabsList(
  { className, ...rest },
  ref,
) {
  const { variant, fullWidth } = React.useContext(TabsStyleContext);
  return <TabsPrimitive.List ref={ref} className={list({ variant, fullWidth, className })} {...rest} />;
});

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  isDisabled?: boolean;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { isDisabled, disabled, className, ...rest },
  ref,
) {
  const { variant, color, size, fullWidth } = React.useContext(TabsStyleContext);
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      disabled={isDisabled || disabled}
      className={trigger({ variant, size, fullWidth, class: [selected[variant][color], className] })}
      {...rest}
    />
  );
});

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
  { className, ...rest },
  ref,
) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "data-[state=active]:animate-cennge-fade-in motion-reduce:animate-none",
        className,
      )}
      {...rest}
    />
  );
});
