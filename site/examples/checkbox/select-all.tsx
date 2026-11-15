"use client";

import { useState } from "react";
import { Checkbox } from "cennge-ui";

const labels = ["bug", "documentation", "good first issue"];

export default function LabelFilter() {
  const [checked, setChecked] = useState<string[]>(["bug"]);
  const all = checked.length === labels.length;

  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        isSelected={all}
        isIndeterminate={checked.length > 0 && !all}
        onValueChange={(isSelected) => setChecked(isSelected ? labels : [])}
      >
        All labels
      </Checkbox>
      {labels.map((label) => (
        <Checkbox
          key={label}
          className="pl-7.5"
          isSelected={checked.includes(label)}
          onValueChange={(isSelected) =>
            setChecked((current) => (isSelected ? [...current, label] : current.filter((item) => item !== label)))
          }
        >
          {label}
        </Checkbox>
      ))}
    </div>
  );
}
