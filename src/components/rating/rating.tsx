import * as React from "react";
import { tv } from "../../utils/tv";
import { useCenngeDefaults } from "../../provider";
import { useId } from "../../utils/use-id";
import type { CenngeColor, CenngeSize } from "../../types";
import { useFormField } from "../form/form";

const rating = tv({
  slots: {
    base: "flex flex-col gap-1.5",
    label: "text-sm font-medium text-foreground",
    control: "inline-flex w-fit touch-manipulation items-center rounded-small outline-none select-none",
    item: "relative block shrink-0 rounded-small outline-none transition-transform duration-(--cennge-duration-fast) ease-tactile motion-reduce:transition-none",
    icon: "relative block",
    empty: "block size-full text-default-500 dark:text-default-400",
    filled: "absolute inset-0 block size-full",
    helper: "text-xs text-muted",
  },
  variants: {
    // Every star is at least 24px wide, so stars stay easy to tap (WCAG 2.5.8).
    size: {
      sm: { item: "p-1", icon: "size-4" },
      md: { item: "p-0.5", icon: "size-5" },
      lg: { item: "p-0.5", icon: "size-7" },
    },
    color: {
      default: { filled: "text-foreground" },
      primary: { filled: "text-primary" },
      secondary: { filled: "text-secondary" },
      success: { filled: "text-success" },
      warning: { filled: "text-warning" },
      danger: { filled: "text-danger" },
      info: { filled: "text-info" },
    },
    kind: {
      radiogroup: {
        item: "cursor-pointer focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring active:scale-90 data-[hovered]:scale-110",
      },
      slider: {
        control: "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring",
        item: "active:scale-90 data-[hovered]:scale-110",
      },
      img: {},
    },
    // Disabled fades the stars; the label turns muted rather than faint, so it stays readable.
    isDisabled: {
      true: { control: "cursor-not-allowed", item: "cursor-not-allowed active:scale-100", icon: "opacity-(--cennge-disabled-opacity)", label: "text-muted" },
    },
    isInvalid: { true: { label: "text-danger-text", helper: "text-danger-text" } },
  },
  // Read-only stars are not tap targets, so small ones sit closer together.
  compoundVariants: [{ kind: "img", size: "sm", class: { item: "p-0.5" } }],
});

/** A five-point star with round tips, centred in its 24×24 box. */
const STAR = "M12 3.32 14.56 9.4 21.13 9.95 16.14 14.26 17.64 20.68 12 17.27 6.36 20.68 7.86 14.26 2.87 9.95 9.44 9.4Z";

function Star({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="block size-full" strokeLinejoin="round">
      {filled ? (
        // In the light theme the edge is a shade darker: amber on a light page needs it to stand out (3:1).
        <path
          d={STAR}
          fill="currentColor"
          strokeWidth={2}
          className="stroke-[color-mix(in_oklab,currentColor_72%,black)] dark:stroke-current"
        />
      ) : (
        <path d={STAR} fill="none" stroke="currentColor" strokeWidth={1.75} />
      )}
    </svg>
  );
}

export interface RatingProps {
  /** Visible label. Without it, pass `aria-label`. */
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  /** 0 means no rating yet. */
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** @default 5 */
  count?: number;
  /** Half stars: the left half of a star picks 3.5, the right half 4. */
  allowHalf?: boolean;
  /** A click on the chosen star, or Backspace / Delete, clears the rating back to 0. @default true */
  isClearable?: boolean;
  /** Shows a value, such as an average of 4.3, as a picture with a text name. Takes no input. */
  isReadOnly?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  /**
   * Spoken name of a value, for each star and for the read-only picture.
   * @default (value) => value === 0 ? "No rating" : `${value} stars`
   */
  getValueLabel?: (value: number) => string;
  /** Replaces the star, e.g. a heart. Drawn twice with currentColor: in the colour when filled, muted when empty. */
  icon?: React.ReactNode;
  /** The empty version of `icon`. @default icon */
  emptyIcon?: React.ReactNode;
  /** @default "warning" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  /** Form field name; the value is submitted as a number, or empty without a rating. */
  name?: string;
  className?: string;
  "aria-label"?: string;
}

const defaultValueLabel = (value: number) => (value === 0 ? "No rating" : `${value} ${value === 1 ? "star" : "stars"}`);

export function Rating({
  label,
  description,
  errorMessage: errorMessageProp,
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  count = 5,
  allowHalf = false,
  isClearable = true,
  isReadOnly = false,
  isDisabled = false,
  isRequired = false,
  isInvalid: isInvalidProp = false,
  getValueLabel = defaultValueLabel,
  icon,
  emptyIcon,
  color,
  size,
  name,
  className,
  "aria-label": ariaLabel,
}: RatingProps) {
  const defaults = useCenngeDefaults();
  const id = useId();
  // Errors from a surrounding <Form>: server ones by name.
  const field = useFormField(name, { isInvalid: isInvalidProp, errorMessage: errorMessageProp });
  const isInvalid = field.isInvalid;
  const errorMessage = field.errorMessage;
  const [inner, setInner] = React.useState(defaultValue);
  const [hovered, setHovered] = React.useState<number | null>(null);
  // After a click the star under the pointer keeps its new look until the pointer moves to another value.
  const settled = React.useRef<number | null>(null);
  const items = React.useRef<Array<HTMLSpanElement | null>>([]);

  const step = allowHalf ? 0.5 : 1;
  const raw = Math.min(Math.max(valueProp ?? inner, 0), count);
  // Interactive ratings hold whole steps; a read-only one shows any value, like an average of 4.3.
  const value = isReadOnly ? raw : Math.round(raw / step) * step;
  // WAI-ARIA APG: up to seven choices read best as radios, more (half stars, a 10-point scale) as a slider.
  const kind = isReadOnly ? "img" : allowHalf || count > 7 ? "slider" : "radiogroup";
  const isInteractive = kind !== "img" && !isDisabled;
  const shown = isInteractive && hovered !== null ? hovered : value;

  const slots = rating({
    size: size ?? defaults.size ?? "md",
    color: color ?? "warning",
    kind,
    isDisabled,
    isInvalid,
  });
  const labelId = id ? `${id}-label` : undefined;
  const helperId = id ? `${id}-helper` : undefined;
  const valueTextId = id ? `${id}-value` : undefined;
  const helper = isInvalid && errorMessage ? errorMessage : description;

  const set = (next: number) => {
    if (next === value) return;
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
    field.markEdited();
  };

  /** The value under the pointer: the star it is on, and for half stars which half. */
  const valueAt = (event: React.PointerEvent | React.MouseEvent) => {
    const star = (event.target as Element).closest<HTMLElement>("[data-star]");
    if (!star || !event.currentTarget.contains(star)) return null;
    const index = Number(star.dataset.star);
    if (!allowHalf) return index + 1;
    const box = star.getBoundingClientRect();
    return index + (event.clientX - box.left < box.width / 2 ? 0.5 : 1);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isInteractive || event.pointerType === "touch") return;
    const next = valueAt(event);
    if (next === null || next === settled.current) return;
    settled.current = null;
    setHovered(next);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isInteractive) return;
    const picked = valueAt(event);
    if (picked === null) return;
    set(isClearable && picked === value ? 0 : picked);
    settled.current = picked;
    setHovered(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) return;
    // Radios move from the focused star; the slider from its value.
    const focused = kind === "radiogroup" ? Number((event.target as HTMLElement).dataset.star) + 1 : value;
    let next: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = Math.min(count, focused + step);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        // Arrows stop at the lowest rating instead of wrapping round; clearing is a separate key.
        next = focused === 0 ? 0 : Math.max(step, focused - step);
        break;
      case "PageUp":
        if (kind === "slider") next = Math.min(count, focused + 2 * step);
        break;
      case "PageDown":
        if (kind === "slider") next = focused === 0 ? 0 : Math.max(step, focused - 2 * step);
        break;
      case "Home":
        next = step;
        break;
      case "End":
        next = count;
        break;
      case " ":
        if (kind === "radiogroup") next = focused;
        break;
      case "Backspace":
      case "Delete":
        if (isClearable) next = 0;
        break;
    }
    if (next === null) return;
    event.preventDefault();
    set(next);
    if (kind === "radiogroup" && next > 0) items.current[next - 1]?.focus();
  };

  const valueText = getValueLabel(value);
  const naming =
    kind === "img"
      ? label
        ? { "aria-labelledby": `${labelId} ${valueTextId}` }
        : { "aria-label": ariaLabel ? `${ariaLabel}: ${valueText}` : valueText }
      : label
        ? { "aria-labelledby": labelId }
        : { "aria-label": ariaLabel };

  const controlProps =
    kind === "radiogroup"
      ? {
          role: "radiogroup",
          "aria-required": isRequired || undefined,
          "aria-invalid": isInvalid || undefined,
          "aria-disabled": isDisabled || undefined,
        }
      : kind === "slider"
        ? {
            role: "slider",
            tabIndex: isDisabled ? undefined : 0,
            "aria-valuemin": 0,
            "aria-valuemax": count,
            "aria-valuenow": value,
            "aria-valuetext": valueText,
            "aria-disabled": isDisabled || undefined,
          }
        : { role: "img" };

  // The radio in the tab order: the chosen star, or the first one before anything is chosen.
  const tabStop = value > 0 ? Math.ceil(value) - 1 : 0;

  return (
    <div className={slots.base({ class: className })} data-field-name={name}>
      {label ? (
        <span id={labelId} className={slots.label()}>
          {label}
          {isRequired && kind !== "img" ? <span className="ml-0.5 text-danger-text">*</span> : null}
        </span>
      ) : null}
      <div
        {...controlProps}
        {...naming}
        aria-describedby={helper ? helperId : undefined}
        className={slots.control()}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => {
          settled.current = null;
          setHovered(null);
        }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {Array.from({ length: count }, (_, index) => {
          const fill = Math.min(Math.max(shown - index, 0), 1);
          const starValue = index + 1;
          const radio =
            kind === "radiogroup"
              ? {
                  role: "radio",
                  "aria-checked": value === starValue,
                  "aria-label": getValueLabel(starValue),
                  "aria-disabled": isDisabled || undefined,
                  tabIndex: isDisabled ? undefined : index === tabStop ? 0 : -1,
                }
              : {};
          return (
            <span
              key={index}
              ref={(node) => {
                items.current[index] = node;
              }}
              data-star={index}
              data-hovered={(isInteractive && hovered !== null && Math.ceil(hovered) === starValue) || undefined}
              data-filled={fill === 1 ? "full" : fill > 0 ? "partial" : undefined}
              className={slots.item()}
              {...radio}
            >
              <span className={slots.icon()}>
                <span className={slots.empty()}>{emptyIcon ?? icon ?? <Star />}</span>
                {fill > 0 ? (
                  <span
                    className={slots.filled()}
                    style={fill < 1 ? { clipPath: `inset(0 ${Math.round((1 - fill) * 1000) / 10}% 0 0)` } : undefined}
                  >
                    {icon ?? <Star filled />}
                  </span>
                ) : null}
              </span>
            </span>
          );
        })}
      </div>
      {kind === "img" && label ? (
        <span id={valueTextId} hidden>
          {valueText}
        </span>
      ) : null}
      {name ? <input type="hidden" name={name} value={value > 0 ? String(value) : ""} /> : null}
      {helper ? (
        <div id={helperId} className={slots.helper()}>
          {helper}
        </div>
      ) : null}
    </div>
  );
}
