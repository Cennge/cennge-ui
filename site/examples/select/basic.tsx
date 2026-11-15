"use client";

import { useState } from "react";
import { Select, SelectItem } from "cennge-ui";

export default function LicensePicker() {
  const [license, setLicense] = useState<string | null>(null);
  return (
    <Select
      label="License"
      placeholder="No license"
      value={license}
      onValueChange={setLicense}
      isClearable
      description={license === null ? "value is null" : `value is "${license}"`}
      className="w-full max-w-80"
    >
      <SelectItem value="MIT">MIT</SelectItem>
      <SelectItem value="Apache-2.0">Apache 2.0</SelectItem>
      <SelectItem value="GPL-3.0">GPL 3.0</SelectItem>
    </Select>
  );
}
