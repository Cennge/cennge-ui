import * as React from "react";
import { unstable_PasswordToggleField as PasswordToggleField } from "radix-ui";
import { tv } from "../../utils/tv";
import { useId } from "../../utils/use-id";
import { useCenngeDefaults } from "../../provider";
import type { CenngeColor, CenngeRadius, CenngeSize } from "../../types";
import { input, type InputVariant } from "../input/input.styles";

type PasswordInputSlots =
  | "base"
  | "label"
  | "inputWrapper"
  | "input"
  | "toggle"
  | "capsLock"
  | "description"
  | "errorMessage";

const extras = tv({
  slots: {
    toggle: [
      "-mr-1.5 flex shrink-0 cursor-pointer items-center justify-center rounded-small text-muted",
      "transition-[background-color,color,transform] duration-(--cennge-duration-fast) ease-tactile motion-reduce:transition-none",
      "hover:bg-default-bg hover:text-foreground active:scale-90",
      "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
      "disabled:pointer-events-none",
    ],
    capsLock: "flex items-center gap-1.5 text-xs text-warning-text",
  },
  variants: {
    size: {
      sm: { toggle: "size-6" },
      md: { toggle: "size-7" },
      lg: { toggle: "size-8" },
    },
  },
});

export interface PasswordInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "color" | "type" | "value" | "defaultValue" | "autoComplete"
  > {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Shown instead of `description` while `isInvalid`. */
  errorMessage?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /**
   * `"new-password"` on sign-up and change-password forms, so password managers offer to
   * generate one. @default "current-password"
   */
  autoComplete?: "current-password" | "new-password";
  /** Show the password as plain text. A form submit or reset hides it again. */
  isVisible?: boolean;
  defaultVisible?: boolean;
  onVisibilityChange?: (isVisible: boolean) => void;
  /**
   * Accessible name of the show/hide button. It stays the same; the button's pressed state says
   * whether the password is shown. @default "Show password"
   */
  toggleLabel?: string;
  /** Hint shown while Caps Lock is on. `false` turns it off. @default "Caps Lock is on" */
  capsLockWarning?: React.ReactNode;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** @default "flat" */
  variant?: InputVariant;
  /** Focus colour. @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  /** @default "md" */
  radius?: CenngeRadius;
  startContent?: React.ReactNode;
  classNames?: Partial<Record<PasswordInputSlots, string>>;
}

function EyeIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" />
      {isOpen ? null : <path d="M4 4l16 16" strokeLinecap="round" />}
    </svg>
  );
}

function CapsLockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path d="M12 4 4.5 12H9v4h6v-4h4.5L12 4Z M9 20h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A password field with a show/hide button and a Caps Lock hint. */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(props, ref) {
  const defaults = useCenngeDefaults();
  const {
    label,
    description,
    errorMessage,
    value,
    defaultValue,
    onChange,
    onValueChange,
    isVisible: isVisibleProp,
    defaultVisible = false,
    onVisibilityChange,
    toggleLabel = "Show password",
    capsLockWarning = "Caps Lock is on",
    isInvalid = false,
    isRequired = false,
    isDisabled: isDisabledProp = false,
    disabled,
    required,
    variant = "flat",
    color = defaults.color === "default" || !defaults.color ? "primary" : defaults.color,
    size = defaults.size ?? "md",
    radius = defaults.radius ?? "md",
    startContent,
    className,
    classNames,
    id: idProp,
    onKeyDown,
    onKeyUp,
    onBlur,
    ...rest
  } = props;

  const id = useId(idProp);
  const helperId = id ? `${id}-helper` : undefined;
  const capsLockId = id ? `${id}-caps-lock` : undefined;
  const isDisabled = isDisabledProp || Boolean(disabled);
  const isRequiredField = isRequired || Boolean(required);

  const [innerVisible, setInnerVisible] = React.useState(defaultVisible);
  const isVisible = isVisibleProp ?? innerVisible;
  const setVisible = (next: boolean) => {
    if (isVisibleProp === undefined) setInnerVisible(next);
    onVisibilityChange?.(next);
  };

  // Caps Lock state is only readable from keyboard events.
  const [isCapsLockOn, setCapsLockOn] = React.useState(false);
  const readCapsLock = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof event.getModifierState === "function") setCapsLockOn(event.getModifierState("CapsLock"));
  };
  const showCapsLock = isCapsLockOn && capsLockWarning !== false && capsLockWarning != null;

  const slots = input({ variant, color, size, radius, isInvalid });
  const extraSlots = extras({ size });
  const helper = isInvalid && errorMessage ? errorMessage : description;
  // Same order as on screen: the Caps Lock hint first.
  const describedBy = [showCapsLock ? capsLockId : null, helper ? helperId : null].filter(Boolean).join(" ");

  return (
    <PasswordToggleField.Root visible={isVisible} onVisibilityChange={setVisible}>
      <div
        className={slots.base({ class: [classNames?.base, className] })}
        data-disabled={isDisabled || undefined}
        data-required={isRequiredField || undefined}
        data-invalid={isInvalid || undefined}
      >
        {label ? (
          <label htmlFor={id} className={slots.label({ class: classNames?.label })}>
            {label}
          </label>
        ) : null}
        <div className={slots.inputWrapper({ class: classNames?.inputWrapper })}>
          {startContent}
          <PasswordToggleField.Input
            ref={ref}
            id={id}
            value={value}
            defaultValue={defaultValue}
            onChange={(event) => {
              onChange?.(event);
              onValueChange?.(event.target.value);
            }}
            disabled={isDisabled}
            required={isRequiredField}
            aria-invalid={isInvalid || undefined}
            aria-describedby={describedBy || undefined}
            onKeyDown={(event) => {
              onKeyDown?.(event);
              readCapsLock(event);
            }}
            onKeyUp={(event) => {
              onKeyUp?.(event);
              readCapsLock(event);
            }}
            onBlur={(event) => {
              onBlur?.(event);
              setCapsLockOn(false);
            }}
            className={slots.input({ class: classNames?.input })}
            {...rest}
          />
          <PasswordToggleField.Toggle
            // Its own id: Radix 0.2 would give the button the input's id.
            id={id ? `${id}-toggle` : undefined}
            aria-label={toggleLabel}
            aria-pressed={isVisible}
            disabled={isDisabled}
            className={extraSlots.toggle({ class: classNames?.toggle })}
          >
            <EyeIcon isOpen={!isVisible} />
          </PasswordToggleField.Toggle>
        </div>
        {showCapsLock ? (
          <div id={capsLockId} className={extraSlots.capsLock({ class: classNames?.capsLock })}>
            <CapsLockIcon />
            {capsLockWarning}
          </div>
        ) : null}
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
    </PasswordToggleField.Root>
  );
});
