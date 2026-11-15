"use client";

import { Select, SelectItem, type InputVariant } from "cennge-ui";

const variants: InputVariant[] = ["flat", "bordered", "faded", "underlined"];

export default function SelectVariants() {
  return (
    <div className="grid w-full gap-x-6 gap-y-5 sm:grid-cols-2">
      {variants.map((variant) => (
        <Select key={variant} variant={variant} label={variant[0]!.toUpperCase() + variant.slice(1)} defaultValue="main">
          <SelectItem value="main">main</SelectItem>
          <SelectItem value="next">next</SelectItem>
        </Select>
      ))}
      <Select size="sm" label="Small" defaultValue="main">
        <SelectItem value="main">main</SelectItem>
        <SelectItem value="next">next</SelectItem>
      </Select>
      <Select size="lg" label="Large" defaultValue="main">
        <SelectItem value="main">main</SelectItem>
        <SelectItem value="next">next</SelectItem>
      </Select>
    </div>
  );
}
