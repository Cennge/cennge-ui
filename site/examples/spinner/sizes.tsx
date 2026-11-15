"use client";

import { Spinner, type CenngeColor, type CenngeSize } from "cennge-ui";

const sizes: CenngeSize[] = ["sm", "md", "lg"];
const colors: CenngeColor[] = ["default", "primary", "secondary", "success", "warning", "danger", "info"];

export default function SpinnerSizes() {
  return (
    <div className="flex flex-col gap-6 text-sm text-muted">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {sizes.map((size) => (
          <span key={size} className="flex items-center gap-2 text-foreground">
            <Spinner size={size} />
            {size}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {colors.map((color) => (
          <span key={color} className="flex items-center gap-2">
            <Spinner color={color} size="lg" />
            {color}
          </span>
        ))}
      </div>
    </div>
  );
}
