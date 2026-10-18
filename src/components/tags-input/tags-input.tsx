import * as React from "react";
import { useId } from "../../utils/use-id";
import { useCenngeDefaults } from "../../provider";
import type { CenngeColor, CenngeRadius, CenngeSize } from "../../types";
import { input, type InputVariant } from "../input/input.styles";
import { ClearIcon } from "../listbox/styles";
import { Tag } from "../listbox/tag";

export type TagsInputEvent =
  | { type: "added"; tag: string }
  | { type: "removed"; tag: string }
  | { type: "duplicate"; tag: string }
  | { type: "invalid"; tag: string }
  | { type: "limit"; tag: string };

const defaultAnnouncement = (event: TagsInputEvent): string => {
  switch (event.type) {
    case "added":
      return `Added ${event.tag}`;
    case "removed":
      return `Removed ${event.tag}`;
    case "duplicate":
      return `${event.tag} is already added`;
    case "invalid":
      return `${event.tag} is not allowed`;
    case "limit":
      return "Tag limit reached";
  }
};

type TagsInputSlots = "base" | "label" | "inputWrapper" | "input" | "tag" | "clearButton" | "description" | "errorMessage";

export interface TagsInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "color" | "value" | "defaultValue" | "onChange"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (tags: string[]) => void;
  /** Keys that turn the typed text into a tag. Single characters also split pasted text. @default ["Enter", ","] */
  separators?: string[];
  maxTags?: number;
  /** Same text in different case counts as a duplicate. @default false */
  allowDuplicates?: boolean;
  /** Return false to refuse a tag. */
  validate?: (tag: string) => boolean;
  /** Turn leftover text into a tag when the field loses focus. @default true */
  addOnBlur?: boolean;
  /** What screen readers hear after a change. Override to translate. */
  formatAnnouncement?: (event: TagsInputEvent) => string;
  /** Accessible name of a tag's remove button. @default (tag) => `Remove ${tag}` */
  removeLabel?: (tag: string) => string;
  isClearable?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  /** @default "flat" */
  variant?: InputVariant;
  /** @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  /** @default "md" */
  radius?: CenngeRadius;
  startContent?: React.ReactNode;
  classNames?: Partial<Record<TagsInputSlots, string>>;
}

const escapeForClass = (char: string) => char.replace(/[\\\]^-]/g, "\\$&");

export const TagsInput = React.forwardRef<HTMLInputElement, TagsInputProps>(function TagsInput(props, ref) {
  const defaults = useCenngeDefaults();
  const {
    label,
    description,
    errorMessage,
    value: valueProp,
    defaultValue,
    onValueChange,
    separators = ["Enter", ","],
    maxTags,
    allowDuplicates = false,
    validate,
    addOnBlur = true,
    formatAnnouncement = defaultAnnouncement,
    removeLabel = (tag: string) => `Remove ${tag}`,
    isClearable = false,
    isInvalid = false,
    isRequired = false,
    isDisabled: isDisabledProp = false,
    disabled,
    isReadOnly: isReadOnlyProp = false,
    readOnly,
    required,
    variant = "flat",
    color,
    size,
    radius,
    startContent,
    name,
    id: idProp,
    placeholder,
    className,
    classNames,
    onKeyDown,
    onBlur,
    onPaste,
    ...rest
  } = props;

  const id = useId(idProp);
  const helperId = id ? `${id}-helper` : undefined;
  const isDisabled = isDisabledProp || Boolean(disabled);
  const isReadOnly = isReadOnlyProp || Boolean(readOnly);
  const sizeValue = size ?? defaults.size ?? "md";

  /* ------------------------------------------------------------- state */
  const isControlled = valueProp !== undefined;
  const [innerTags, setInnerTags] = React.useState<string[]>(defaultValue ?? []);
  const tags = isControlled ? valueProp : innerTags;
  const latestTags = React.useRef(tags);
  latestTags.current = tags;
  const [text, setText] = React.useState("");
  const [announcement, setAnnouncement] = React.useState("");
  const [highlighted, setHighlighted] = React.useState<string | null>(null);
  const [pendingFocus, setPendingFocus] = React.useState<number | "input" | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const tagButtons = React.useRef<(HTMLButtonElement | null)[]>([]);
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const highlightTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(highlightTimer.current), []);
  const flash = (tag: string) => {
    setHighlighted(tag);
    clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlighted(null), 900);
  };

  // Focus moves after removal need the new DOM, so they run after render.
  React.useEffect(() => {
    if (pendingFocus === null) return;
    const target = pendingFocus === "input" ? inputRef.current : (tagButtons.current[pendingFocus] ?? inputRef.current);
    target?.focus();
    setPendingFocus(null);
  }, [pendingFocus, tags]);

  const commit = (next: string[]) => {
    latestTags.current = next;
    if (!isControlled) setInnerTags(next);
    onValueChange?.(next);
  };

  const isSame = (a: string, b: string) => a.toLocaleLowerCase() === b.toLocaleLowerCase();

  /** Adds what it can; returns the candidates it refused. */
  const addTags = (candidates: string[]): string[] => {
    const next = [...latestTags.current];
    const refused: string[] = [];
    let message = "";
    for (const candidate of candidates.map((c) => c.trim()).filter(Boolean)) {
      if (maxTags !== undefined && next.length >= maxTags) {
        refused.push(candidate);
        message = formatAnnouncement({ type: "limit", tag: candidate });
        continue;
      }
      const existing = next.find((tag) => isSame(tag, candidate));
      if (existing !== undefined && !allowDuplicates) {
        refused.push(candidate);
        flash(existing);
        message = formatAnnouncement({ type: "duplicate", tag: candidate });
        continue;
      }
      if (validate && !validate(candidate)) {
        refused.push(candidate);
        message = formatAnnouncement({ type: "invalid", tag: candidate });
        continue;
      }
      next.push(candidate);
      message = formatAnnouncement({ type: "added", tag: candidate });
    }
    if (next.length !== latestTags.current.length) commit(next);
    if (message) setAnnouncement(message);
    return refused;
  };

  const splitChars = separators.filter((s) => s.length === 1);
  const splitter = new RegExp(`[${[...splitChars, "\n", "\r"].map(escapeForClass).join("")}]`);

  const removeAt = (index: number, focus: number | "input" | null) => {
    const tag = latestTags.current[index];
    if (tag === undefined || isDisabled || isReadOnly) return;
    commit(latestTags.current.filter((_, i) => i !== index));
    setAnnouncement(formatAnnouncement({ type: "removed", tag }));
    if (focus !== null) setPendingFocus(focus);
  };

  const submitText = () => {
    if (!text.trim()) return;
    if (addTags([text]).length === 0) setText(""); // refused text stays so it can be fixed
  };

  /*
   * Separators that arrive as text: Android keyboards report most keys as "Unidentified" in
   * keydown, and autofill or drag-and-drop insert text without any key at all. Everything before
   * the last separator becomes tags; what follows it is still being typed.
   */
  const handleChange = (value: string) => {
    if (!splitter.test(value)) {
      setText(value);
      return;
    }
    const parts = value.split(splitter);
    const typing = parts.pop() ?? "";
    const refused = addTags(parts);
    setText([...refused, typing.trimStart()].filter(Boolean).join(", "));
  };

  /* ------------------------------------------------------------ events */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing) return;
    if (separators.includes(event.key)) {
      if (text.trim()) {
        event.preventDefault();
        submitText();
      } else if (event.key !== "Enter") {
        event.preventDefault(); // no stray separators; Enter on an empty field still submits the form
      }
      return;
    }
    if (event.key === "Backspace" && text === "" && tags.length > 0) {
      event.preventDefault();
      removeAt(tags.length - 1, null);
      return;
    }
    if (event.key === "ArrowLeft" && text === "" && tags.length > 0) {
      event.preventDefault();
      tagButtons.current[tags.length - 1]?.focus();
    }
  };

  // Arrow keys walk the tags; Backspace / Delete remove the focused one.
  const handleTagKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        tagButtons.current[Math.max(0, index - 1)]?.focus();
        break;
      case "ArrowRight":
        event.preventDefault();
        if (index >= tags.length - 1) inputRef.current?.focus();
        else tagButtons.current[index + 1]?.focus();
        break;
      case "Backspace":
      case "Delete": {
        event.preventDefault();
        const nextFocus = tags.length === 1 ? "input" : index >= tags.length - 1 ? index - 1 : index;
        removeAt(index, nextFocus);
        break;
      }
      case "Escape":
        event.preventDefault();
        inputRef.current?.focus();
        break;
    }
  };

  // Split pasted lists here, before a single-line input drops their line breaks.
  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(event);
    if (event.defaultPrevented) return;
    const pasted = event.clipboardData?.getData("text") ?? "";
    if (!splitter.test(pasted)) return; // a single value: let the browser paste it
    event.preventDefault();
    const refused = addTags((text + pasted).split(splitter));
    setText(refused.join(", "));
  };

  /* ------------------------------------------------------------ styles */
  const slots = input({
    variant,
    color: color ?? (defaults.color && defaults.color !== "default" ? defaults.color : "primary"),
    size: sizeValue,
    radius: radius ?? defaults.radius ?? "md",
    isInvalid,
  });
  const helper = isInvalid && errorMessage ? errorMessage : description;
  const showClear = isClearable && (tags.length > 0 || text !== "") && !isDisabled && !isReadOnly;
  const minHeight = sizeValue === "sm" ? "2rem" : sizeValue === "lg" ? "3rem" : "2.5rem";

  return (
    <div
      className={slots.base({ class: [classNames?.base, className] })}
      data-disabled={isDisabled || undefined}
      data-required={isRequired || Boolean(required) || undefined}
      data-invalid={isInvalid || undefined}
    >
      {label ? (
        <label htmlFor={id} className={slots.label({ class: classNames?.label })}>
          {label}
        </label>
      ) : null}
      <div
        className={slots.inputWrapper({ class: ["h-auto py-1.5", classNames?.inputWrapper] })}
        style={{ minHeight }}
        onMouseDown={(event) => {
          // Clicks on empty space focus the input; clicks on buttons keep their own behaviour.
          if (event.target === inputRef.current || (event.target as HTMLElement).closest("button")) return;
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        {startContent}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {tags.map((tag, index) => (
            <Tag
              key={`${tag}-${index}`}
              size={sizeValue}
              removeLabel={removeLabel(tag)}
              isDisabled={isDisabled || isReadOnly}
              isHighlighted={highlighted !== null && isSame(highlighted, tag)}
              buttonRef={(node) => {
                tagButtons.current[index] = node;
              }}
              onButtonKeyDown={handleTagKeyDown(index)}
              // Keyboard activation (detail 0) keeps focus among the tags; a mouse click returns to the input.
              onRemove={(event) =>
                removeAt(index, event.detail === 0 ? (tags.length === 1 ? "input" : Math.min(index, tags.length - 2)) : "input")
              }
              className={classNames?.tag}
            >
              {tag}
            </Tag>
          ))}
          <input
            ref={inputRef}
            id={id}
            type="text"
            autoComplete="off"
            value={text}
            placeholder={tags.length > 0 ? undefined : placeholder}
            disabled={isDisabled}
            readOnly={isReadOnly}
            // Native "required" only while there is nothing yet: tags count as a value.
            required={(isRequired || Boolean(required)) && tags.length === 0}
            aria-invalid={isInvalid || undefined}
            aria-describedby={helper ? helperId : undefined}
            onChange={(event) => handleChange(event.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={(event) => {
              onBlur?.(event);
              if (addOnBlur) submitText();
            }}
            className={slots.input({ class: ["min-w-20", classNames?.input] })}
            {...rest}
          />
        </div>
        {showClear ? (
          <button
            type="button"
            aria-label="Clear"
            onClick={() => {
              commit([]);
              setText("");
              setAnnouncement(formatAnnouncement({ type: "removed", tag: tags.join(", ") }));
              inputRef.current?.focus();
            }}
            className={slots.clearButton({ class: classNames?.clearButton })}
          >
            <ClearIcon />
          </button>
        ) : null}
      </div>
      {/* Changes to the tag list are not otherwise announced by screen readers. */}
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
      {name ? tags.map((tag, index) => <input key={`${tag}-${index}`} type="hidden" name={name} value={tag} />) : null}
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
