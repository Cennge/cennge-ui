"use client";

import { Input, type InputVariant } from "cennge-ui";

const variants: InputVariant[] = ["flat", "bordered", "faded", "underlined"];

export default function InputVariants() {
  return (
    <div className="grid w-full max-w-xl gap-x-6 gap-y-5 sm:grid-cols-2">
      {variants.map((variant) => (
        <Input key={variant} variant={variant} label={variant[0]!.toUpperCase() + variant.slice(1)} placeholder="ai-niche-scout" />
      ))}
    </div>
  );
}
