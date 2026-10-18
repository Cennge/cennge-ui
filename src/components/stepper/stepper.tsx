import * as React from "react";
import { tv } from "../../utils/tv";
import { cn } from "../../utils/cn";
import { Spinner } from "../spinner";
import type { CenngeColor, CenngeSize } from "../../types";

export type StepState = "completed" | "current" | "upcoming" | "error";

export interface StepProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Replaces the step number. */
  icon?: React.ReactNode;
  /** Shown when the step is current: the form for this step. */
  children?: React.ReactNode;
  /** Marks the step as failed (e.g. validation). */
  isError?: boolean;
  /** Shows a spinner while the step is current, e.g. while saving. */
  isLoading?: boolean;
  /** Not clickable even when onStepClick is set. */
  isDisabled?: boolean;
}

/** One step. Only meaningful inside <Stepper>; it renders through the Stepper. */
export function Step(_props: StepProps): React.ReactElement | null {
  return null;
}

const stepper = tv({
  slots: {
    root: "@container flex w-full flex-col gap-6",
    list: "flex",
    item: "flex min-w-0",
    trigger: "flex min-w-0 gap-3 rounded-medium text-left outline-none",
    indicator: [
      "relative flex shrink-0 items-center justify-center rounded-full font-semibold tabular-nums",
      "transition-[background-color,border-color,color] duration-(--cennge-duration) ease-tactile motion-reduce:transition-none",
    ],
    text: "flex min-w-0 flex-col",
    title: "font-semibold",
    description: "text-xs text-muted",
    connector: "shrink-0 rounded-full bg-border transition-colors duration-(--cennge-duration) motion-reduce:transition-none",
    content: "text-sm",
  },
  variants: {
    orientation: {
      horizontal: {
        list: "items-start gap-3",
        // Narrow container: equal columns with the label under the indicator.
        item: "flex-1 items-center gap-3 last:flex-none @max-md:flex-col @max-md:items-center @max-md:last:flex-1",
        trigger: "items-center @max-md:flex-col @max-md:items-center @max-md:text-center",
        connector: "h-0.5 min-w-4 flex-1 @max-md:hidden",
      },
      vertical: {
        list: "flex-col",
        item: "gap-3",
        trigger: "items-start",
        connector: "my-1.5 min-h-6 w-0.5 flex-1",
        content: "pt-3 pb-6",
      },
    },
    size: {
      sm: { indicator: "size-6 text-xs [&_svg]:size-3", title: "text-xs", description: "text-[11px]" },
      md: { indicator: "size-8 text-sm [&_svg]:size-4", title: "text-sm" },
      lg: { indicator: "size-10 text-base [&_svg]:size-5", title: "text-base", description: "text-sm" },
    },
    state: {
      completed: { indicator: "inset-shadow-tactile shadow-raised", title: "text-foreground" },
      current: { indicator: "border-2", title: "text-foreground" },
      upcoming: { indicator: "border-2 border-border bg-surface-2 text-muted", title: "text-muted" },
      error: { indicator: "bg-danger text-danger-foreground inset-shadow-tactile", title: "text-danger-text" },
    },
    isClickable: {
      true: {
        trigger: [
          "cursor-pointer -m-1 p-1 transition-colors hover:bg-default-bg",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        ],
      },
    },
    color: {
      default: {},
      primary: {},
      secondary: {},
      success: {},
      warning: {},
      danger: {},
      info: {},
    },
  },
  compoundVariants: [
    // Literal classes per colour so Tailwind can find them.
    { state: "completed", color: "default", class: { indicator: "bg-default-500 text-white" } },
    { state: "completed", color: "primary", class: { indicator: "bg-primary text-primary-foreground" } },
    { state: "completed", color: "secondary", class: { indicator: "bg-secondary text-secondary-foreground" } },
    { state: "completed", color: "success", class: { indicator: "bg-success text-success-foreground" } },
    { state: "completed", color: "warning", class: { indicator: "bg-warning text-warning-foreground" } },
    { state: "completed", color: "danger", class: { indicator: "bg-danger text-danger-foreground" } },
    { state: "completed", color: "info", class: { indicator: "bg-info text-info-foreground" } },
    { state: "current", color: "default", class: { indicator: "border-default-500 bg-default-bg text-foreground" } },
    { state: "current", color: "primary", class: { indicator: "border-primary bg-primary-bg text-primary-text" } },
    { state: "current", color: "secondary", class: { indicator: "border-secondary bg-secondary-bg text-secondary-text" } },
    { state: "current", color: "success", class: { indicator: "border-success bg-success-bg text-success-text" } },
    { state: "current", color: "warning", class: { indicator: "border-warning bg-warning-bg text-warning-text" } },
    { state: "current", color: "danger", class: { indicator: "border-danger bg-danger-bg text-danger-text" } },
    { state: "current", color: "info", class: { indicator: "border-info bg-info-bg text-info-text" } },
  ],
});

/* A finished connector takes the step colour. */
const doneConnector: Record<CenngeColor, string> = {
  default: "bg-default-500",
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

export interface StepperProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Index of the current step, from 0. Equal to the number of steps once everything is done. */
  activeStep: number;
  /** Makes finished steps clickable so the user can go back. */
  onStepClick?: (index: number) => void;
  /** With onStepClick: also allow jumping to steps ahead. @default false */
  allowNextStepsSelect?: boolean;
  /** @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** @default "primary" */
  color?: CenngeColor;
  /** @default "md" */
  size?: CenngeSize;
  /** Shown once activeStep is past the last step. */
  completedContent?: React.ReactNode;
  /** Read by screen readers after each step title. */
  stateLabels?: Partial<Record<StepState, string>>;
  /** @default "Progress" */
  "aria-label"?: string;
  /** <Step> elements. */
  children?: React.ReactNode;
}

const defaultStateLabels: Record<StepState, string> = {
  completed: "completed",
  current: "current step",
  upcoming: "not started",
  error: "has an error",
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M12 7v6M12 17v.5" strokeLinecap="round" />
    </svg>
  );
}

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(function Stepper(
  {
    activeStep,
    onStepClick,
    allowNextStepsSelect = false,
    orientation = "horizontal",
    color = "primary",
    size = "md",
    completedContent,
    stateLabels,
    "aria-label": ariaLabel = "Progress",
    className,
    children,
    ...rest
  },
  ref,
) {
  const steps = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<StepProps>[];
  const labels = { ...defaultStateLabels, ...stateLabels };
  const isHorizontal = orientation === "horizontal";
  const base = stepper({ orientation, size, color });
  const activeContent =
    activeStep >= steps.length ? completedContent : (steps[activeStep]?.props.children ?? null);

  return (
    <div ref={ref} className={base.root({ class: className })} {...rest}>
      <ol aria-label={ariaLabel} className={base.list()}>
        {steps.map((step, index) => {
          const { title, description, icon, isError, isLoading, isDisabled } = step.props;
          const state: StepState = isError
            ? "error"
            : index < activeStep
              ? "completed"
              : index === activeStep
                ? "current"
                : "upcoming";
          const isClickable =
            Boolean(onStepClick) &&
            !isDisabled &&
            index !== activeStep &&
            (index < activeStep || allowNextStepsSelect);
          const slots = stepper({ orientation, size, color, state, isClickable });
          const isLast = index === steps.length - 1;

          const marker =
            state === "error" ? (
              <ErrorIcon />
            ) : state === "completed" ? (
              <CheckIcon />
            ) : state === "current" && isLoading ? (
              <Spinner size="sm" />
            ) : (
              (icon ?? index + 1)
            );

          const isActive = index === activeStep;
          const indicator = (
            <span aria-hidden="true" data-slot="indicator" className={slots.indicator()}>
              {marker}
            </span>
          );
          const text = (
            <span className={slots.text()}>
              {/* The state follows the title so it reads "Settings, current step", then the description. */}
              <span data-slot="title" className={slots.title()}>
                {title}
                <span className="sr-only">, {labels[state]}</span>
              </span>
              {description ? (
                <span data-slot="description" className={slots.description()}>
                  {description}
                </span>
              ) : null}
            </span>
          );
          // Finished steps (or any step with allowNextStepsSelect) become buttons.
          const trigger = (content: React.ReactNode) =>
            isClickable ? (
              <button type="button" onClick={() => onStepClick?.(index)} className={slots.trigger()}>
                {content}
              </button>
            ) : (
              <div className={slots.trigger()}>{content}</div>
            );
          const connector = isLast ? null : (
            <span aria-hidden="true" className={cn(slots.connector(), index < activeStep && doneConnector[color])} />
          );

          return (
            <li
              key={step.key ?? index}
              aria-current={isActive ? "step" : undefined}
              data-state={state}
              className={slots.item()}
            >
              {isHorizontal ? (
                <>
                  {trigger(
                    <>
                      {indicator}
                      {text}
                    </>,
                  )}
                  {connector}
                </>
              ) : (
                <>
                  {/* Vertical: the indicator with the connector under it; text and the active step's content beside. */}
                  <div className="flex flex-col items-center">
                    {indicator}
                    {connector}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    {trigger(text)}
                    <div className={slots.content({ class: isLast && !isActive ? "pb-0" : undefined })}>
                      {isActive ? step.props.children : null}
                    </div>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ol>
      {isHorizontal || activeStep >= steps.length ? (
        activeContent ? <div className={base.content()}>{activeContent}</div> : null
      ) : null}
    </div>
  );
});
