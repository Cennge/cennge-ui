import * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { tv } from "../../utils/tv";

export type AccordionVariant = "light" | "bordered" | "splitted";

const VariantContext = React.createContext<AccordionVariant>("light");

const accordion = tv({
  slots: {
    root: "flex w-full flex-col",
    item: "",
    trigger: [
      "group flex w-full cursor-pointer items-center gap-3 py-4 text-left outline-none",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      "disabled:cursor-not-allowed disabled:opacity-(--cennge-disabled-opacity)",
    ],
    title: "text-base font-semibold text-foreground",
    subtitle: "text-sm text-muted",
    chevron: [
      "ml-auto size-5 shrink-0 text-muted transition-transform duration-(--cennge-duration) ease-tactile",
      "group-data-[state=open]:rotate-180 motion-reduce:transition-none",
    ],
    content: [
      "overflow-hidden text-sm text-muted",
      "data-[state=open]:animate-cennge-accordion-down data-[state=closed]:animate-cennge-accordion-up motion-reduce:animate-none",
    ],
  },
  variants: {
    variant: {
      light: { item: "border-b border-border last:border-b-0" },
      bordered: { root: "rounded-large border border-border px-4", item: "border-b border-border last:border-b-0" },
      splitted: { root: "gap-2", item: "rounded-large bg-surface-3 px-4 shadow-raised" },
    },
  },
});

interface AccordionBaseProps {
  /** @default "light" */
  variant?: AccordionVariant;
  className?: string;
  children?: React.ReactNode;
  isDisabled?: boolean;
}

export interface AccordionSingleProps extends AccordionBaseProps {
  /** @default "single" */
  selectionMode?: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Allow closing the open item. @default true */
  isCollapsible?: boolean;
}

export interface AccordionMultipleProps extends AccordionBaseProps {
  selectionMode: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

export function Accordion(props: AccordionProps) {
  const { variant = "light", className, children, isDisabled } = props;
  const slots = accordion({ variant });
  const common = { className: slots.root({ class: className }), disabled: isDisabled };

  return (
    <VariantContext.Provider value={variant}>
      {props.selectionMode === "multiple" ? (
        <AccordionPrimitive.Root
          type="multiple"
          value={props.value}
          defaultValue={props.defaultValue}
          onValueChange={props.onValueChange}
          {...common}
        >
          {children}
        </AccordionPrimitive.Root>
      ) : (
        <AccordionPrimitive.Root
          type="single"
          collapsible={props.isCollapsible ?? true}
          value={props.value}
          defaultValue={props.defaultValue}
          onValueChange={props.onValueChange}
          {...common}
        >
          {children}
        </AccordionPrimitive.Root>
      )}
    </VariantContext.Provider>
  );
}

export interface AccordionItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  value: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  startContent?: React.ReactNode;
  isDisabled?: boolean;
}

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { value, title, subtitle, startContent, isDisabled, className, children, ...rest },
  ref,
) {
  const variant = React.useContext(VariantContext);
  const slots = accordion({ variant });
  return (
    <AccordionPrimitive.Item ref={ref} value={value} disabled={isDisabled} className={slots.item({ class: className })} {...rest}>
      <AccordionPrimitive.Header asChild>
        <h3>
          <AccordionPrimitive.Trigger className={slots.trigger()}>
            {startContent ? <span className="flex shrink-0 items-center">{startContent}</span> : null}
            <span className="flex min-w-0 flex-col">
              <span className={slots.title()}>{title}</span>
              {subtitle ? <span className={slots.subtitle()}>{subtitle}</span> : null}
            </span>
            <svg viewBox="0 0 24 24" className={slots.chevron()} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </AccordionPrimitive.Trigger>
        </h3>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className={slots.content()}>
        <div className="pb-4">{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
});
