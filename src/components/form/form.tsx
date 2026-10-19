import * as React from "react";

type FieldErrors = Record<string, string | string[] | null | undefined>;

interface FormContextValue {
  /** The error to show for a field: the browser's own check, or one from `validationErrors`. */
  errorFor: (name: string) => string | undefined;
  /** The user changed the field, so a server error for it no longer applies. */
  markEdited: (name: string) => void;
}

const FormContext = React.createContext<FormContextValue | null>(null);

/**
 * For fields: merges the field's own `isInvalid`/`errorMessage` with an error its <Form> holds for `name`.
 * Its own message wins; without one, the form's shows. Call `markEdited` when the user changes the value
 * by other means than typing into a named input (picking from a list, a calendar, stars).
 */
export function useFormField(
  name: string | undefined,
  own: { isInvalid?: boolean; errorMessage?: React.ReactNode } = {},
) {
  const form = React.useContext(FormContext);
  const formError = name && form ? form.errorFor(name) : undefined;
  return {
    isInvalid: Boolean(own.isInvalid) || formError !== undefined,
    errorMessage: own.isInvalid && own.errorMessage ? own.errorMessage : (formError ?? own.errorMessage),
    markEdited: React.useCallback(() => {
      if (name && form) form.markEdited(name);
    }, [name, form]),
  };
}

/** The field an element belongs to: its own name, or the nearest field wrapper's. */
function fieldName(element: EventTarget | null): string | undefined {
  if (!(element instanceof Element)) return undefined;
  const own = element.getAttribute("name");
  if (own) return own;
  return element.closest("[data-field-name]")?.getAttribute("data-field-name") ?? undefined;
}

const FOCUSABLE =
  'input:not([type="hidden"]):not([aria-hidden="true"]), select:not([aria-hidden="true"]), textarea, button, [tabindex]:not([tabindex="-1"])';

/** Focus the control a person would fix: the element itself, or the first control of its field that takes focus. */
function focusField(form: HTMLFormElement, element: Element | null, name: string | undefined) {
  const wrapper =
    element?.closest("[data-field-name]") ??
    Array.from(form.querySelectorAll("[data-field-name]")).find((node) => node.getAttribute("data-field-name") === name);
  const candidates = [element, ...Array.from(wrapper?.querySelectorAll(FOCUSABLE) ?? [])];
  for (const candidate of candidates) {
    if (!(candidate instanceof HTMLElement) || !candidate.matches(FOCUSABLE)) continue;
    candidate.focus();
    // Hidden or disabled controls do not take focus; try the next one.
    if (document.activeElement === candidate) return;
  }
}

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /**
   * Errors by field name, e.g. returned by a server action: `{ email: "Already taken" }`. Each shows under
   * its field until the user edits that field; a new object shows the new set and focuses the first.
   */
  validationErrors?: FieldErrors;
}

/**
 * A `<form>` whose fields show errors in their own place: from `validationErrors` (a server action, an API),
 * and from the browser's checks (`isRequired`, `type="email"`, `minLength`, `pattern`) instead of its tooltips.
 * A blocked submit focuses the first field to fix. Works with `action` (React 19 server actions) and `onSubmit`.
 */
export const Form = React.forwardRef<HTMLFormElement, FormProps>(function Form(
  { validationErrors, onReset, children, ...rest },
  forwardedRef,
) {
  const formRef = React.useRef<HTMLFormElement | null>(null);
  React.useImperativeHandle(forwardedRef, () => formRef.current as HTMLFormElement);
  const [native, setNative] = React.useState<Record<string, string>>({});
  const [edited, setEdited] = React.useState<ReadonlySet<string>>(() => new Set());

  // A new set of server errors: show all of them again, and take the person to the first.
  React.useEffect(() => {
    setEdited(new Set());
    const form = formRef.current;
    if (!form || !validationErrors) return;
    const names = Object.keys(validationErrors).filter((name) => validationErrors[name]?.length);
    if (names.length === 0) return;
    const first = Array.from(form.querySelectorAll("[name], [data-field-name]")).find((node) => {
      const name = fieldName(node);
      return name !== undefined && names.includes(name);
    });
    if (first) focusField(form, first, fieldName(first));
  }, [validationErrors]);

  React.useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    let firstInvalid: { target: Element; name: string } | null = null;
    // The browser checks fields on submit and fires "invalid" on each failing one, in order.
    const onInvalid = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const name = fieldName(target);
      if (!name) return;
      event.preventDefault(); // our message under the field, not the browser's tooltip
      setNative((previous) =>
        previous[name] === target.validationMessage ? previous : { ...previous, [name]: target.validationMessage },
      );
      if (firstInvalid) return;
      firstInvalid = { target, name };
      // After the whole check (microtasks run between its events), focus the first field that failed.
      window.setTimeout(() => {
        if (firstInvalid) focusField(form, firstInvalid.target, firstInvalid.name);
        firstInvalid = null;
      });
    };
    // Editing a field drops its server error and re-checks its own constraints as the person types.
    const onEdit = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const name = fieldName(target);
      if (!name) return;
      // After the event: a render in the middle of it (React flushes in a microtask, which runs between
      // listeners) would put a controlled input's old value back before its onChange sees the new one.
      window.setTimeout(() => {
        setEdited((previous) => (previous.has(name) ? previous : new Set(previous).add(name)));
        setNative((previous) => {
          if (!(name in previous)) return previous;
          if (target.validity && !target.validity.valid) {
            return previous[name] === target.validationMessage ? previous : { ...previous, [name]: target.validationMessage };
          }
          const { [name]: _fixed, ...rest } = previous;
          return rest;
        });
      });
    };
    // Radix checkboxes, radios and switches tell their hidden input with a click, not a change.
    const onToggle = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target instanceof HTMLInputElement && (target.type === "checkbox" || target.type === "radio")) onEdit(event);
    };
    form.addEventListener("invalid", onInvalid, true);
    form.addEventListener("input", onEdit, true);
    form.addEventListener("change", onEdit, true);
    form.addEventListener("click", onToggle, true);
    return () => {
      form.removeEventListener("invalid", onInvalid, true);
      form.removeEventListener("input", onEdit, true);
      form.removeEventListener("change", onEdit, true);
      form.removeEventListener("click", onToggle, true);
    };
  }, []);

  const context = React.useMemo<FormContextValue>(
    () => ({
      errorFor: (name) => {
        if (native[name]) return native[name];
        const server = validationErrors?.[name];
        if (!server || edited.has(name)) return undefined;
        const message = Array.isArray(server) ? server.filter(Boolean).join(" ") : server;
        return message || undefined;
      },
      markEdited: (name) => setEdited((previous) => (previous.has(name) ? previous : new Set(previous).add(name))),
    }),
    [native, validationErrors, edited],
  );

  return (
    <FormContext.Provider value={context}>
      <form
        ref={formRef}
        onReset={(event) => {
          onReset?.(event);
          // Only the browser's errors go. Server errors stay: React 19 resets a form right after its action
          // returns, and that is exactly when they arrive.
          setNative({});
        }}
        {...rest}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
});
