import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { tv } from "../../utils/tv";
import { useCenngeDefaults } from "../../provider";
import type { CenngeColor, CenngeSize } from "../../types";

export type ToggleGroupVariant = "segmented" | "bordered";

interface ItemStyle {
  variant: ToggleGroupVariant;
  color: CenngeColor;
  size: CenngeSize;
  fullWidth: boolean;
}

const ItemStyleContext = React.createContext<ItemStyle>({
  variant: "segmented",
  color: "default",
  size: "md",
  fullWidth: false,
});

const root = tv({
  // w-fit: a flex-column parent would otherwise stretch the group to its full width.
  base: "inline-flex w-fit items-center",
  variants: {
    variant: {
      // Translucent track: reads as sunken on any surface, in both themes.
      segmented: "gap-1 rounded-medium bg-default-bg p-1 inset-shadow-[inset_0_1px_2px_rgb(0_0_0/0.18)]",
      bordered: "overflow-hidden rounded-medium border border-border",
    },
    fullWidth: { true: "flex w-full" },
  },
});

/* Selected-state colours. Literal per colour so Tailwind finds them. */
const selected: Record<ToggleGroupVariant, Record<CenngeColor, string>> = {
  segmented: {
    default: "data-[state=on]:bg-surface-4 data-[state=on]:text-foreground",
    primary: "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
    secondary: "data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground",
    success: "data-[state=on]:bg-success data-[state=on]:text-success-foreground",
    warning: "data-[state=on]:bg-warning data-[state=on]:text-warning-foreground",
    danger: "data-[state=on]:bg-danger data-[state=on]:text-danger-foreground",
    info: "data-[state=on]:bg-info data-[state=on]:text-info-foreground",
  },
  bordered: {
    default: "data-[state=on]:bg-surface-4 data-[state=on]:text-foreground",
    primary: "data-[state=on]:bg-primary-bg data-[state=on]:text-primary-text",
    secondary: "data-[state=on]:bg-secondary-bg data-[state=on]:text-secondary-text",
    success: "data-[state=on]:bg-success-bg data-[state=on]:text-success-text",
    warning: "data-[state=on]:bg-warning-bg data-[state=on]:text-warning-text",
    danger: "data-[state=on]:bg-danger-bg data-[state=on]:text-danger-text",
    info: "data-[state=on]:bg-info-bg data-[state=on]:text-info-text",
  },
};

const item = tv({
  base: [
    "inline-flex cursor-pointer items-center justify-center gap-2 font-semibold whitespace-nowrap text-muted",
    "transition-[color,background-color,box-shadow] duration-(--cennge-duration-fast) ease-tactile motion-reduce:transition-none",
    "hover:text-foreground outline-none focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-(--cennge-disabled-opacity)",
  ],
  variants: {
    variant: {
      segmented: "rounded-small data-[state=on]:inset-shadow-tactile data-[state=on]:shadow-raised",
      bordered: "border-l border-border first:border-l-0 hover:bg-default-bg",
    },
    size: {
      sm: "h-7 px-2.5 text-xs",
      md: "h-8 px-3 text-sm",
      lg: "h-10 px-4 text-base",
    },
    isIconOnly: { true: "px-0" },
    fullWidth: { true: "flex-1" },
  },
  compoundVariants: [
    { variant: "bordered", size: "sm", class: "h-8" },
    { variant: "bordered", size: "md", class: "h-9" },
    { variant: "bordered", size: "lg", class: "h-11" },
    { isIconOnly: true, size: "sm", class: "w-7" },
    { isIconOnly: true, size: "md", class: "w-8" },
    { isIconOnly: true, size: "lg", class: "w-10" },
  ],
});

interface ToggleGroupBaseProps {
  /** @default "segmented" */
  variant?: ToggleGroupVariant;
  /** Colour of the selected items. @default "default" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  fullWidth?: boolean;
  isDisabled?: boolean;
  /** @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  className?: string;
  children?: React.ReactNode;
  /** Name the group for screen readers. */
  "aria-label"?: string;
}

export interface ToggleGroupSingleProps extends ToggleGroupBaseProps {
  /** @default "single" */
  selectionMode?: "single";
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /**
   * Allow clicking the selected item to clear the selection. Off by default, so a
   * segmented control always has a value. @default false
   */
  isDeselectable?: boolean;
}

export interface ToggleGroupMultipleProps extends ToggleGroupBaseProps {
  selectionMode: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

export function ToggleGroup(props: ToggleGroupProps) {
  const defaults = useCenngeDefaults();
  const {
    variant = "segmented",
    color = "default",
    size,
    fullWidth = false,
    isDisabled,
    orientation,
    className,
    children,
    "aria-label": ariaLabel,
  } = props;
  const style = React.useMemo(
    () => ({ variant, color, size: size ?? defaults.size ?? "md", fullWidth }),
    [variant, color, size, defaults.size, fullWidth],
  );

  // Both modes are controlled internally so the single mode can refuse an empty value.
  const isMultiple = props.selectionMode === "multiple";
  const [inner, setInner] = React.useState<string[]>(() => {
    if (props.selectionMode === "multiple") return props.defaultValue ?? [];
    return props.defaultValue ? [props.defaultValue] : [];
  });
  const controlled =
    props.selectionMode === "multiple"
      ? props.value
      : props.value === undefined
        ? undefined
        : props.value === null
          ? []
          : [props.value];
  const current = controlled ?? inner;

  const common = {
    disabled: isDisabled,
    orientation,
    "aria-label": ariaLabel,
    className: root({ variant, fullWidth, className }),
  };

  return (
    <ItemStyleContext.Provider value={style}>
      {isMultiple ? (
        <ToggleGroupPrimitive.Root
          type="multiple"
          value={current}
          onValueChange={(next) => {
            if (controlled === undefined) setInner(next);
            props.onValueChange?.(next);
          }}
          {...common}
        >
          {children}
        </ToggleGroupPrimitive.Root>
      ) : (
        <ToggleGroupPrimitive.Root
          type="single"
          value={current[0] ?? ""}
          onValueChange={(next) => {
            if (next === "" && !props.isDeselectable) return;
            if (controlled === undefined) setInner(next === "" ? [] : [next]);
            props.onValueChange?.(next === "" ? null : next);
          }}
          {...common}
        >
          {children}
        </ToggleGroupPrimitive.Root>
      )}
    </ItemStyleContext.Provider>
  );
}

export interface ToggleGroupItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
  isDisabled?: boolean;
  /** Square item for a single icon. Give it an `aria-label`. */
  isIconOnly?: boolean;
}

export const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(function ToggleGroupItem(
  { value, isDisabled, disabled, isIconOnly = false, className, ...rest },
  ref,
) {
  const { variant, color, size, fullWidth } = React.useContext(ItemStyleContext);
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      value={value}
      disabled={isDisabled || disabled}
      className={item({ variant, size, isIconOnly, fullWidth, class: [selected[variant][color], className] })}
      {...rest}
    />
  );
});
