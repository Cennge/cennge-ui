"use client";

import { Fragment } from "react";
import type { CenngeColor } from "cennge-ui";

const roles: { name: CenngeColor; label: string }[] = [
  { name: "default", label: "Archived" },
  { name: "primary", label: "Featured" },
  { name: "secondary", label: "Beta" },
  { name: "success", label: "Passed" },
  { name: "warning", label: "Flaky" },
  { name: "danger", label: "Failed" },
  { name: "info", label: "Queued" },
];

// Whole class names, so Tailwind finds them in the source.
const solid: Record<CenngeColor, string> = {
  default: "bg-default text-default-foreground",
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-danger text-danger-foreground",
  info: "bg-info text-info-foreground",
};

const tint: Record<CenngeColor, string> = {
  default: "bg-default-bg",
  primary: "bg-primary-bg",
  secondary: "bg-secondary-bg",
  success: "bg-success-bg",
  warning: "bg-warning-bg",
  danger: "bg-danger-bg",
  info: "bg-info-bg",
};

const highlight: Record<CenngeColor, string> = {
  default: "bg-default-highlight",
  primary: "bg-primary-highlight",
  secondary: "bg-secondary-highlight",
  success: "bg-success-highlight",
  warning: "bg-warning-highlight",
  danger: "bg-danger-highlight",
  info: "bg-info-highlight",
};

const text: Record<CenngeColor, string> = {
  default: "text-default-text",
  primary: "text-primary-text",
  secondary: "text-secondary-text",
  success: "text-success-text",
  warning: "text-warning-text",
  danger: "text-danger-text",
  info: "text-info-text",
};

const chip = "inline-flex h-7 items-center rounded-small px-2.5 text-xs font-medium";

export default function ColourRoles() {
  return (
    <div className="grid w-full grid-cols-[auto_auto_auto_1fr] items-center gap-2 sm:gap-x-4">
      {["Solid", "-bg", "-highlight", "-text"].map((heading) => (
        <span key={heading} className="pb-1 font-mono text-xs text-muted">
          {heading}
        </span>
      ))}
      {roles.map(({ name, label }) => (
        <Fragment key={name}>
          <span className={`${chip} ${solid[name]}`}>{name}</span>
          <span className={`${chip} ${tint[name]} ${text[name]}`}>{label}</span>
          <span className={`${chip} ${highlight[name]} ${text[name]}`}>{label}</span>
          <span className={`text-sm font-medium ${text[name]}`}>{label}</span>
        </Fragment>
      ))}
    </div>
  );
}
