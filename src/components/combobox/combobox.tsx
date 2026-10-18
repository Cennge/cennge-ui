import * as React from "react";
import { Popover } from "radix-ui";
import { cn } from "../../utils/cn";
import { useId } from "../../utils/use-id";
import { useCenngeDefaults } from "../../provider";
import type { CenngeColor, CenngeRadius, CenngeSize } from "../../types";
import { input, type InputVariant } from "../input/input.styles";
import { CheckIcon, ChevronIcon, ClearIcon, optionCheckClass, optionClass, popoverClass } from "../listbox/styles";

export interface ComboboxItem {
  value: string;
  /** Shown in the list and used for filtering. */
  label: string;
  description?: React.ReactNode;
  startContent?: React.ReactNode;
  isDisabled?: boolean;
}

type ComboboxSlots =
  | "base"
  | "label"
  | "inputWrapper"
  | "input"
  | "popover"
  | "option"
  | "tag"
  | "clearButton"
  | "description"
  | "errorMessage";

interface ComboboxBaseProps {
  items: ComboboxItem[];
  label?: React.ReactNode;
  placeholder?: string;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  /** Shown when nothing matches the query. @default "No results" */
  emptyContent?: React.ReactNode;
  /** Custom matching. Default: case-insensitive "contains" on the label. */
  filter?: (item: ComboboxItem, query: string) => boolean;
  onInputChange?: (query: string) => void;
  isClearable?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** @default "flat" */
  variant?: InputVariant;
  /** @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  /** @default "md" */
  radius?: CenngeRadius;
  startContent?: React.ReactNode;
  /** Form field name; selected values are submitted as hidden inputs. */
  name?: string;
  id?: string;
  className?: string;
  classNames?: Partial<Record<ComboboxSlots, string>>;
  "aria-label"?: string;
}

export interface ComboboxSingleProps extends ComboboxBaseProps {
  /** @default "single" */
  selectionMode?: "single";
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}

export interface ComboboxMultipleProps extends ComboboxBaseProps {
  selectionMode: "multiple";
  values?: string[];
  defaultValues?: string[];
  onValuesChange?: (values: string[]) => void;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;

const defaultFilter = (item: ComboboxItem, query: string) =>
  item.label.toLowerCase().includes(query.trim().toLowerCase());

const tagSizes: Record<CenngeSize, string> = {
  sm: "h-5 text-[11px]",
  md: "h-6 text-xs",
  lg: "h-7 text-sm",
};

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(props, ref) {
  const {
    items,
    label,
    placeholder,
    description,
    errorMessage,
    emptyContent = "No results",
    filter = defaultFilter,
    onInputChange,
    isClearable = false,
    isInvalid = false,
    isRequired = false,
    isDisabled = false,
    variant = "flat",
    color,
    size,
    radius,
    startContent,
    name,
    id: idProp,
    className,
    classNames,
    "aria-label": ariaLabel,
  } = props;
  const isMultiple = props.selectionMode === "multiple";

  const defaults = useCenngeDefaults();
  const sizeValue = size ?? defaults.size ?? "md";
  const id = useId(idProp);
  const listId = id ? `${id}-listbox` : undefined;
  const helperId = id ? `${id}-helper` : undefined;
  const optionId = (index: number) => (id ? `${id}-option-${index}` : undefined);

  /* ----------------------------------------------------- selection state */
  const controlledSelection = isMultiple ? props.values : props.value === undefined ? undefined : props.value === null ? [] : [props.value];
  const [innerSelection, setInnerSelection] = React.useState<string[]>(() => {
    if (isMultiple) return props.defaultValues ?? [];
    return props.defaultValue ? [props.defaultValue] : [];
  });
  const selection = controlledSelection ?? innerSelection;

  const commit = (next: string[]) => {
    if (controlledSelection === undefined) setInnerSelection(next);
    if (props.selectionMode === "multiple") props.onValuesChange?.(next);
    else props.onValueChange?.(next[0] ?? null);
  };

  const labelOf = React.useCallback(
    (value: string) => items.find((item) => item.value === value)?.label ?? value,
    [items],
  );

  /* ---------------------------------------------------- input and popup */
  const singleLabel = !isMultiple && selection[0] !== undefined ? labelOf(selection[0]) : "";
  const [query, setQuery] = React.useState(singleLabel);
  // Only filter after the user types; opening with the arrow or a click shows the whole list.
  const [isFiltering, setIsFiltering] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  // Keep the text in sync with an externally changed single value.
  React.useEffect(() => {
    if (!isMultiple && !isOpen) setQuery(singleLabel);
  }, [isMultiple, isOpen, singleLabel]);

  const visible = React.useMemo(
    () => (isFiltering && query ? items.filter((item) => filter(item, query)) : items),
    [items, filter, query, isFiltering],
  );

  const firstEnabled = (from: number, step: 1 | -1) => {
    for (let i = from; i >= 0 && i < visible.length; i += step) {
      if (!visible[i]?.isDisabled) return i;
    }
    return -1;
  };

  const open = () => {
    if (isDisabled || isOpen) return;
    setIsOpen(true);
    const selectedIndex = visible.findIndex((item) => item.value === selection[0]);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabled(0, 1));
  };

  const close = () => {
    setIsOpen(false);
    setIsFiltering(false);
    setActiveIndex(-1);
    setQuery(isMultiple ? "" : singleLabel);
  };

  const select = (item: ComboboxItem) => {
    if (item.isDisabled) return;
    if (isMultiple) {
      const next = selection.includes(item.value)
        ? selection.filter((v) => v !== item.value)
        : [...selection, item.value];
      commit(next);
      setQuery("");
      setIsFiltering(false);
      inputRef.current?.focus();
    } else {
      commit([item.value]);
      setIsOpen(false);
      setIsFiltering(false);
      setActiveIndex(-1);
      setQuery(item.label);
    }
  };

  const clear = () => {
    commit([]);
    setQuery("");
    setIsFiltering(false);
    onInputChange?.("");
    inputRef.current?.focus();
  };

  // Keep the active option in view while moving with the keyboard.
  React.useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    const node = optionId(activeIndex) ? document.getElementById(optionId(activeIndex)!) : null;
    node?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, isOpen]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        if (!isOpen) return open();
        const next = firstEnabled(activeIndex + 1, 1);
        setActiveIndex(next === -1 ? firstEnabled(0, 1) : next);
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        if (!isOpen) return open();
        const prev = firstEnabled(activeIndex - 1, -1);
        setActiveIndex(prev === -1 ? firstEnabled(visible.length - 1, -1) : prev);
        break;
      }
      case "Home":
        if (isOpen) {
          event.preventDefault();
          setActiveIndex(firstEnabled(0, 1));
        }
        break;
      case "End":
        if (isOpen) {
          event.preventDefault();
          setActiveIndex(firstEnabled(visible.length - 1, -1));
        }
        break;
      case "Enter": {
        if (!isOpen) return;
        event.preventDefault(); // never submit the form while picking
        const item = visible[activeIndex];
        if (item) select(item);
        break;
      }
      case "Escape":
        if (isOpen) {
          event.preventDefault();
          close();
        }
        break;
      case "Tab":
        if (isOpen) close();
        break;
      case "Backspace":
        if (isMultiple && query === "" && selection.length > 0) {
          commit(selection.slice(0, -1));
        }
        break;
    }
  };

  /* ------------------------------------------------------------- styles */
  const slots = input({
    variant,
    color: color ?? (defaults.color && defaults.color !== "default" ? defaults.color : "primary"),
    size: sizeValue,
    radius: radius ?? defaults.radius ?? "md",
    isInvalid,
  });
  const helper = isInvalid && errorMessage ? errorMessage : description;
  const hasValue = selection.length > 0 || query !== "";
  const showClear = isClearable && hasValue && !isDisabled;
  const activeDescendant = isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined;

  return (
    <div
      className={slots.base({ class: [classNames?.base, className] })}
      data-disabled={isDisabled || undefined}
      data-required={isRequired || undefined}
      data-invalid={isInvalid || undefined}
    >
      {label ? (
        <label htmlFor={id} className={slots.label({ class: classNames?.label })}>
          {label}
        </label>
      ) : null}
      <Popover.Root open={isOpen} onOpenChange={(next) => (next ? open() : close())}>
        <Popover.Anchor asChild>
          <div
            ref={anchorRef}
            className={slots.inputWrapper({
              class: [isMultiple && "h-auto py-1.5", classNames?.inputWrapper],
            })}
            style={isMultiple ? { minHeight: sizeValue === "sm" ? "2rem" : sizeValue === "lg" ? "3rem" : "2.5rem" } : undefined}
            onMouseDown={(event) => {
              // Clicking the field (not the input itself) focuses the input and toggles the list.
              if (event.target === inputRef.current) return;
              if ((event.target as HTMLElement).closest("button")) return;
              event.preventDefault();
              inputRef.current?.focus();
              if (isOpen) close();
              else open();
            }}
          >
            {startContent}
            {/* Tags and the input wrap together; the clear button and chevron stay on the right. */}
            <div className={cn("flex min-w-0 flex-1 items-center", isMultiple && "flex-wrap gap-1.5")}>
            {isMultiple
              ? selection.map((value) => (
                  <span
                    key={value}
                    className={cn(
                      "inline-flex max-w-full items-center gap-1 rounded-full bg-surface-4 pr-1 pl-2 font-semibold text-foreground",
                      tagSizes[sizeValue],
                      classNames?.tag,
                    )}
                  >
                    <span className="truncate">{labelOf(value)}</span>
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={`Remove ${labelOf(value)}`}
                      disabled={isDisabled}
                      onClick={() => commit(selection.filter((v) => v !== value))}
                      className="flex size-4 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-default-bg hover:text-foreground"
                    >
                      <ClearIcon />
                    </button>
                  </span>
                ))
              : null}
            <input
              ref={inputRef}
              id={id}
              type="text"
              role="combobox"
              autoComplete="off"
              aria-label={ariaLabel}
              aria-expanded={isOpen}
              aria-controls={isOpen ? listId : undefined}
              aria-autocomplete="list"
              aria-activedescendant={activeDescendant}
              aria-invalid={isInvalid || undefined}
              aria-describedby={helper ? helperId : undefined}
              aria-required={isRequired || undefined}
              disabled={isDisabled}
              placeholder={isMultiple && selection.length > 0 ? undefined : placeholder}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsFiltering(true);
                onInputChange?.(event.target.value);
                if (!isOpen) setIsOpen(true);
                setActiveIndex(0);
              }}
              onKeyDown={onKeyDown}
              onBlur={(event) => {
                // Focus moving into the popup (mouse) keeps it open; anything else closes.
                const next = event.relatedTarget as Node | null;
                if (next && anchorRef.current?.contains(next)) return;
                if (isOpen) close();
              }}
              className={slots.input({ class: [isMultiple && "min-w-16", classNames?.input] })}
            />
            </div>
            {showClear ? (
              <button
                type="button"
                aria-label="Clear"
                onClick={clear}
                className={slots.clearButton({ class: classNames?.clearButton })}
              >
                <ClearIcon />
              </button>
            ) : null}
            <span
              aria-hidden="true"
              className={cn(
                "flex transition-transform duration-(--cennge-duration) motion-reduce:transition-none",
                isOpen && "rotate-180",
              )}
            >
              <ChevronIcon />
            </span>
          </div>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            collisionPadding={8}
            // Focus stays in the input: this is a combobox, not a dialog.
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => event.preventDefault()}
            onInteractOutside={(event) => {
              if (anchorRef.current?.contains(event.target as Node)) event.preventDefault();
            }}
            className={cn(
              popoverClass,
              "max-h-[min(20rem,var(--radix-popover-content-available-height))] w-(--radix-popover-trigger-width) min-w-48",
              "origin-(--radix-popover-content-transform-origin)",
              classNames?.popover,
            )}
          >
            <div
              id={listId}
              role="listbox"
              aria-multiselectable={isMultiple || undefined}
              aria-label={typeof label === "string" ? label : ariaLabel}
            >
              {visible.length === 0 ? (
                <div className="px-2.5 py-6 text-center text-sm text-muted">{emptyContent}</div>
              ) : (
                visible.map((item, index) => {
                  const isSelected = selection.includes(item.value);
                  return (
                    <div
                      key={item.value}
                      id={optionId(index)}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={item.isDisabled || undefined}
                      data-active={index === activeIndex || undefined}
                      data-disabled={item.isDisabled || undefined}
                      onMouseMove={() => index !== activeIndex && !item.isDisabled && setActiveIndex(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => select(item)}
                      className={cn(optionClass, classNames?.option)}
                    >
                      {item.startContent ? <span className="flex shrink-0 items-center">{item.startContent}</span> : null}
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate">{item.label}</span>
                        {item.description ? <span className="truncate text-xs text-muted">{item.description}</span> : null}
                      </span>
                      {isSelected ? (
                        <span className={optionCheckClass}>
                          <CheckIcon />
                        </span>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {name ? selection.map((value) => <input key={value} type="hidden" name={name} value={value} />) : null}
      {helper ? (
        <div
          id={helperId}
          className={
            isInvalid && errorMessage
              ? slots.errorMessage({ class: classNames?.errorMessage })
              : slots.description({ class: classNames?.description })
          }
        >
          {helper}
        </div>
      ) : null}
    </div>
  );
});
