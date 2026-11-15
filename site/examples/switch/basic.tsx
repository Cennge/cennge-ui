"use client";

import { useState } from "react";
import { Switch } from "cennge-ui";

export default function NotificationsSwitch() {
  const [isOn, setOn] = useState(true);
  return (
    <div className="flex flex-col gap-2">
      <Switch isSelected={isOn} onValueChange={setOn}>
        Pull request notifications
      </Switch>
      <p className="text-sm text-muted">
        {isOn ? "Reviews and merges in cennge-ui email dev@example.com." : "No email for pull requests."}
      </p>
    </div>
  );
}
