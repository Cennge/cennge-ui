import * as React from "react";
import { unstable_OneTimePasswordField as OneTimePasswordField } from "radix-ui";
import { tv } from "../../utils/tv";
import { useId } from "../../utils/use-id";
import { useCenngeDefaults } from "../../provider";
import type { CenngeColor, CenngeRadius, CenngeSize } from "../../types";
import { input, type InputVariant } from "../input/input.styles";

type OtpInputSlots = "base" | "label" | "group" | "slot" | "separator" | "description" | "errorMessage";

const otp = tv({
  slots: {
    group: "flex w-fit items-center",
    // Each slot reuses the input box (variant, focus colour, radius) as a square.
    slot: [
      "px-0 text-center font-semibold text-foreground tabular-nums outline-none placeholder:text-muted",
      "disabled:cursor-not-allowed read-only:cursor-default",
    ],
    separator: "h-0.5 w-2.5 shrink-0 rounded-full bg-border",
  },
  variants: {
    size: {
      sm: { group: "gap-1.5", slot: "w-8 text-base" },
      md: { group: "gap-2", slot: "w-10 text-lg" },
      lg: { group: "gap-2.5", slot: "w-12 text-xl" },
    },
  },
});

export type OtpInputCharacters = "numeric" | "alphanumeric" | "alpha";

export interface OtpInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange" | "color" | "placeholder" | "dir"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Shown instead of `description` while `isInvalid`. */
  errorMessage?: React.ReactNode;
  /** Number of characters. @default 6 */
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called with the code once every slot is filled. */
  onComplete?: (code: string) => void;
  /** Submit the surrounding form as soon as the code is complete. @default false */
  autoSubmit?: boolean;
  /** Characters the code may contain; others are ignored, also when pasted. @default "numeric" */
  allowedCharacters?: OtpInputCharacters;
  /** Hide the characters like a password. @default false */
  isMasked?: boolean;
  /** Draw a separator after every `groupSize` slots, e.g. 3 for 123–456. */
  groupSize?: number;
  /** One character per slot, shown while the field is empty, e.g. "000000". */
  placeholder?: string;
  /** Accessible name of each slot. @default (position, length) => `Character ${position} of ${length}` */
  formatSlotLabel?: (position: number, length: number) => string;
  /** Submitted with forms under this name. */
  name?: string;
  /** Id of a form elsewhere on the page to submit with. */
  form?: string;
  autoFocus?: boolean;
  /** Writing direction; arrows follow it. */
  dir?: "ltr" | "rtl";
  isInvalid?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  /** @default "flat" */
  variant?: InputVariant;
  /** Focus colour. @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  /** @default "md" */
  radius?: CenngeRadius;
  classNames?: Partial<Record<OtpInputSlots, string>>;
}

const defaultSlotLabel = (position: number, length: number) => `Character ${position} of ${length}`;

/**
 * A one-time code split into slots. Paste or SMS autofill fills every slot at once, arrows move
 * between slots, and the whole field is a single Tab stop.
 */
export const OtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(function OtpInput(props, ref) {
  const defaults = useCenngeDefaults();
  const {
    label,
    description,
    errorMessage,
    length = 6,
    value,
    defaultValue,
    onValueChange,
    onComplete,
    autoSubmit = false,
    allowedCharacters = "numeric",
    isMasked = false,
    groupSize,
    placeholder,
    formatSlotLabel = defaultSlotLabel,
    name,
    form,
    autoFocus = false,
    isInvalid = false,
    isDisabled = false,
    isReadOnly = false,
    variant = "flat",
    color = defaults.color === "default" || !defaults.color ? "primary" : defaults.color,
    size = defaults.size ?? "md",
    radius = defaults.radius ?? "md",
    className,
    classNames,
    id: idProp,
    ...rest
  } = props;

  const id = useId(idProp);
  const labelId = id ? `${id}-label` : undefined;
  const helperId = id ? `${id}-helper` : undefined;
  const groupRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => groupRef.current as HTMLDivElement);

  // Characters entered so far: typing continues in the slot right after them.
  const filled = React.useRef((value ?? defaultValue ?? "").length);
  if (value !== undefined) filled.current = value.length;
  const focusCurrentSlot = () => {
    const slotInputs = groupRef.current?.querySelectorAll<HTMLInputElement>('input:not([type="hidden"])');
    slotInputs?.[Math.min(filled.current, length - 1)]?.focus();
  };

  // Radix accepts autoFocus but does not act on it yet.
  React.useEffect(() => {
    if (autoFocus) focusCurrentSlot(); // on mount only, like the native attribute
  }, []);

  const handleValueChange = (next: string) => {
    filled.current = next.length;
    onValueChange?.(next);
    if (next.length === length) onComplete?.(next);
  };

  const inputSlots = input({ variant, color, size, radius, isInvalid });
  const otpSlots = otp({ size });
  const helper = isInvalid && errorMessage ? errorMessage : description;

  return (
    <div
      className={inputSlots.base({ class: [classNames?.base, className] })}
      data-disabled={isDisabled || undefined}
      data-invalid={isInvalid || undefined}
    >
      {label ? (
        // Labels the group; a click continues where the code left off.
        <span id={labelId} className={inputSlots.label({ class: ["w-fit", classNames?.label] })} onClick={focusCurrentSlot}>
          {label}
        </span>
      ) : null}
      <OneTimePasswordField.Root
        ref={groupRef}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        autoSubmit={autoSubmit}
        validationType={allowedCharacters}
        type={isMasked ? "password" : "text"}
        placeholder={placeholder}
        name={name}
        form={form}
        disabled={isDisabled}
        readOnly={isReadOnly}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={helper ? helperId : undefined}
        className={otpSlots.group({ class: classNames?.group })}
        {...rest}
      >
        {Array.from({ length }, (_, index) => (
          <React.Fragment key={index}>
            {groupSize && index > 0 && index % groupSize === 0 ? (
              <span aria-hidden="true" className={otpSlots.separator({ class: classNames?.separator })} />
            ) : null}
            <OneTimePasswordField.Input
              index={index}
              aria-label={formatSlotLabel(index + 1, length)}
              aria-invalid={isInvalid || undefined}
              className={inputSlots.inputWrapper({ class: [otpSlots.slot(), classNames?.slot] })}
            />
          </React.Fragment>
        ))}
        {name ? <OneTimePasswordField.HiddenInput /> : null}
      </OneTimePasswordField.Root>
      {helper ? (
        <div
          id={helperId}
          className={
            isInvalid && errorMessage
              ? inputSlots.errorMessage({ class: classNames?.errorMessage })
              : inputSlots.description({ class: classNames?.description })
          }
        >
          {helper}
        </div>
      ) : null}
    </div>
  );
});
