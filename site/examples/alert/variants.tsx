"use client";

import { Alert, type AlertVariant } from "cennge-ui";

const variants: AlertVariant[] = ["flat", "bordered", "faded", "solid"];

export default function AlertVariants() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      {variants.map((variant) => (
        <Alert
          key={variant}
          variant={variant}
          color="info"
          title={variant[0]!.toUpperCase() + variant.slice(1)}
          description="cennge-ui 0.3.1 is out. Run npm update cennge-ui."
        />
      ))}
    </div>
  );
}
