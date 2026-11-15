"use client";

import { Combobox } from "cennge-ui";

// 1,000 options: past 100 the list renders only the rows in view.
const releases = Array.from({ length: 1000 }, (_, index) => {
  const version = `0.${Math.floor(index / 100)}.${index % 100}`;
  return { value: version, label: `cennge-ui@${version}` };
});

export default function ReleasePicker() {
  return <Combobox label="Release" placeholder="Type a version, e.g. 0.3" items={releases} className="w-full max-w-80" />;
}
