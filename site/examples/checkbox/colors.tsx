"use client";

import { Checkbox, type CenngeColor } from "cennge-ui";

const colors: CenngeColor[] = ["default", "primary", "secondary", "success", "warning", "danger", "info"];

export default function CheckboxColors() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {colors.map((color) => (
          <Checkbox key={color} color={color} defaultSelected>
            {color[0]!.toUpperCase() + color.slice(1)}
          </Checkbox>
        ))}
      </div>
      <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
        <Checkbox size="sm" defaultSelected>
          Small
        </Checkbox>
        <Checkbox size="md" defaultSelected>
          Medium
        </Checkbox>
        <Checkbox size="lg" defaultSelected>
          Large
        </Checkbox>
        <Checkbox isDisabled defaultSelected>
          Disabled
        </Checkbox>
      </div>
    </div>
  );
}
