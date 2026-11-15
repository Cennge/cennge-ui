"use client";

import { CircularProgress, type CircularProgressSize } from "cennge-ui";

const sizes: { size: CircularProgressSize; pixels: number }[] = [
  { size: "sm", pixels: 32 },
  { size: "md", pixels: 48 },
  { size: "lg", pixels: 64 },
  { size: "xl", pixels: 96 },
];

export default function CircularSizes() {
  return (
    <div className="flex flex-wrap items-end gap-8">
      {sizes.map(({ size, pixels }, index) => (
        <CircularProgress
          key={size}
          label={`${size}, ${pixels} px`}
          value={25 * (index + 1)}
          showValue={size !== "sm"}
          size={size}
        />
      ))}
    </div>
  );
}
