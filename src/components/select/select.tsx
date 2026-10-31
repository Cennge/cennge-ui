import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { cn } from "../../utils/cn";
import { useId } from "../../utils/use-id";
import { useCenngeDefaults } from "../../provider";
import type { CenngeColor, CenngeRadius, CenngeSize } from "../../types";
import { input, type InputVariant } from "../input/input.styles";
import {
  CheckIcon,
  ChevronIcon,
  ClearIcon,
  groupLabelClass,
  optionCheckClass,
  optionClass,
  popoverClass,
} from "../listbox/styles";
import { useFormField } from "../form/form";

type SelectSlots = "base" | "label" | "trigger" | "value" | "popover" | "clearButton" | "description" | "errorMessage";

export interface SelectProps {
  label?: React.ReactNode;
  placeholder?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  /** Selected value. `null` shows the placeholder. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Shows a clear button that returns to the placeholder. */
  isClearable?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** @default "flat" */
  variant?: InputVariant;
  /** Focus colour. @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  /** @default "md" */
  radius?: CenngeRadius;
  startContent?: React.ReactNode;
  /** Form field name. */
  name?: string;
  id?: string;
  className?: string;
  classNames?: Partial<Record<SelectSlots, string>>;
  "aria-label"?: string;
  /** SelectItem, SelectGroup, SelectSeparator. */
  children?: React.ReactNode;
}

export function Select({
  label,
  placeholder = "Select…",
  description,
  errorMessage: errorMessageProp,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  isClearable = false,
  isInvalid: isInvalidProp = false,
  isRequired = false,
  isDisabled = false,
  isOpen,
  onOpenChange,
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
  children,
}: SelectProps) {
  const defaults = useCenngeDefaults();
  const id = useId(idProp);
  // Errors from a surrounding <Form>: server ones by name, and the browser's own checks.
  const field = useFormField(name, { isInvalid: isInvalidProp, errorMessage: errorMessageProp });
  const isInvalid = field.isInvalid;
  const errorMessage = field.errorMessage;
  const helperId = id ? `${id}-helper` : undefined;

  // Radix uses "" for "nothing selected"; the public API uses null.
  const isControlled = valueProp !== undefined;
  const [innerValue, setInnerValue] = React.useState<string | null>(defaultValue);
  const value = isControlled ? valueProp : innerValue;

  const setValue = (next: string | null) => {
    if (!isControlled) setInnerValue(next);
    onValueChange?.(next);
    field.markEdited();
  };

  const slots = input({
    variant,
    color: color ?? (defaults.color && defaults.color !== "default" ? defaults.color : "primary"),
    size: size ?? defaults.size ?? "md",
    radius: radius ?? defaults.radius ?? "md",
    isInvalid,
  });
  const helper = isInvalid && errorMessage ? errorMessage : description;
  const showClear = isClearable && value !== null && value !== "" && !isDisabled;

  return (
    <div
      className={slots.base({ class: [classNames?.base, className] })}
      data-disabled={isDisabled || undefined}
      data-required={isRequired || undefined}
      data-field-name={name}
      data-invalid={isInvalid || undefined}
    >
      {label ? (
        <label htmlFor={id} className={slots.label({ class: classNames?.label })}>
          {label}
        </label>
      ) : null}
      <SelectPrimitive.Root
        value={value ?? ""}
        onValueChange={(next) => setValue(next === "" ? null : next)}
        open={isOpen}
        onOpenChange={onOpenChange}
        disabled={isDisabled}
        required={isRequired}
        name={name}
      >
        <div className="relative">
          <SelectPrimitive.Trigger
            id={id}
            aria-label={ariaLabel}
            aria-invalid={isInvalid || undefined}
            aria-describedby={helper ? helperId : undefined}
            className={slots.inputWrapper({
              class: [
                "group/trigger cursor-pointer text-left outline-none focus-visible:ring-2 data-[state=open]:ring-2",
                classNames?.trigger,
              ],
            })}
          >
            {startContent}
            <span
              className={cn(
                "flex-1 truncate text-foreground",
                (value === null || value === "") && "text-muted",
                // Room for the clear button, which sits between the value and the chevron.
                showClear && "pr-7",
                classNames?.value,
              )}
            >
              <SelectPrimitive.Value placeholder={placeholder} />
            </span>
            <SelectPrimitive.Icon asChild>
              {/* Its own trigger's state: any open ancestor (a Dialog, an Accordion item) also says data-state="open". */}
              <span className="transition-transform duration-(--cennge-duration) group-data-[state=open]/trigger:rotate-180">
                <ChevronIcon />
              </span>
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          {/* Outside the trigger: a button cannot sit inside another button. */}
          {showClear ? (
            <button
              type="button"
              aria-label="Clear"
              onClick={() => setValue(null)}
              className={slots.clearButton({
                class: ["absolute top-1/2 right-9 mr-0 -translate-y-1/2", classNames?.clearButton],
              })}
            >
              <ClearIcon />
            </button>
          ) : null}
        </div>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={6}
            collisionPadding={8}
            className={cn(
              popoverClass,
              "max-h-(--radix-select-content-available-height) w-(--radix-select-trigger-width) min-w-40",
              "origin-(--radix-select-content-transform-origin)",
              classNames?.popover,
            )}
          >
            <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
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
}

export interface SelectItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "value"> {
  /** Must be non-empty. */
  value: string;
  /** Text used for the trigger and typeahead when children are not plain text. */
  textValue?: string;
  description?: React.ReactNode;
  startContent?: React.ReactNode;
  isDisabled?: boolean;
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(function SelectItem(
  { value, textValue, description, startContent, isDisabled = false, className, children, ...rest },
  ref,
) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      value={value}
      textValue={textValue}
      disabled={isDisabled}
      className={cn(optionClass, className)}
      {...rest}
    >
      {startContent ? <span className="flex shrink-0 items-center">{startContent}</span> : null}
      <span className="flex min-w-0 flex-1 flex-col">
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        {description ? <span className="truncate text-xs text-muted">{description}</span> : null}
      </span>
      <SelectPrimitive.ItemIndicator className={optionCheckClass}>
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
});

export interface SelectGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
}

export function SelectGroup({ label, children, ...rest }: SelectGroupProps) {
  return (
    <SelectPrimitive.Group {...rest}>
      {label ? <SelectPrimitive.Label className={groupLabelClass}>{label}</SelectPrimitive.Label> : null}
      {children}
    </SelectPrimitive.Group>
  );
}

export function SelectSeparator({ className }: { className?: string }) {
  return <SelectPrimitive.Separator className={cn("-mx-1.5 my-1.5 h-px bg-border", className)} />;
}
