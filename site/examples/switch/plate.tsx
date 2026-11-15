"use client";

import { useId, useState } from "react";
import { Badge, Switch, type SwitchProps } from "cennge-ui";

function Setting({ title, description, ...props }: SwitchProps & { title: string; description: string }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-6 py-3.5">
      <div className="flex min-w-0 flex-col gap-0.5">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium">
          {title}
        </label>
        <p id={`${id}-description`} className="text-xs text-muted">
          {description}
        </p>
      </div>
      <Switch id={id} aria-describedby={`${id}-description`} {...props} />
    </div>
  );
}

export default function SwitchPlate() {
  const [deployOnPush, setDeployOnPush] = useState(true);
  const [previews, setPreviews] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="flex w-full max-w-md flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <p id={titleId} className="font-semibold">
          spredo-crypto-screener
        </p>
        <Badge variant="dot" color={maintenance ? "warning" : "success"}>
          {maintenance ? "Maintenance" : "Live"}
        </Badge>
      </div>
      <div className="flex flex-col divide-y divide-border">
        <Setting
          title="Deploy on push to main"
          description={maintenance ? "Paused while the site is in maintenance" : "Every push to main is built and deployed"}
          isSelected={deployOnPush && !maintenance}
          isDisabled={maintenance}
          onValueChange={setDeployOnPush}
        />
        <Setting
          title="Preview deployments"
          description="A preview address for every pull request"
          isSelected={previews}
          onValueChange={setPreviews}
        />
        <Setting
          title="Maintenance mode"
          description="Visitors see a maintenance page"
          color="warning"
          isSelected={maintenance}
          onValueChange={setMaintenance}
        />
      </div>
    </section>
  );
}
