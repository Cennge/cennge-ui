"use client";

import { Switch, type CenngeColor } from "cennge-ui";

const colors: CenngeColor[] = ["default", "primary", "secondary", "success", "warning", "danger", "info"];

export default function SwitchColors() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {colors.map((color) => (
          <Switch key={color} color={color} defaultSelected>
            {color[0]!.toUpperCase() + color.slice(1)}
          </Switch>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Switch size="sm" defaultSelected>
          Small
        </Switch>
        <Switch size="md" defaultSelected>
          Medium
        </Switch>
        <Switch size="lg" defaultSelected>
          Large
        </Switch>
        <Switch isDisabled defaultSelected>
          Disabled
        </Switch>
      </div>
    </div>
  );
}
