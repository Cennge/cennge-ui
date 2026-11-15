"use client";

import { Badge, type BadgeVariant, type CenngeColor } from "cennge-ui";

const variants: BadgeVariant[] = ["solid", "flat", "bordered", "faded", "dot"];
const colors: CenngeColor[] = ["default", "primary", "secondary", "success", "warning", "danger", "info"];

export default function BadgeVariants() {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] items-start gap-x-4 gap-y-3">
      {variants.map((variant) => (
        <div key={variant} className="contents">
          <span className="text-sm leading-6 text-muted">{variant}</span>
          <div className="flex flex-wrap gap-1.5">
            {colors.map((color) => (
              <Badge key={color} variant={variant} color={color}>
                {color}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
