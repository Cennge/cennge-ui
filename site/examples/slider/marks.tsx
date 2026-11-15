"use client";

import { Slider } from "cennge-ui";

const percents = [0, 25, 50, 75, 100].map((value) => ({ value, label: `${value}%` }));

export default function CoverageSlider() {
  return (
    <Slider
      label="Coverage threshold"
      defaultValue={80}
      marks={[...percents, 90]}
      formatValue={(value) => `${value}%`}
      className="w-full max-w-96"
    />
  );
}
