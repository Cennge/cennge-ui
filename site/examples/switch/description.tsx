"use client";

import { useId } from "react";
import { Switch } from "cennge-ui";

export default function AutoMergeSetting() {
  const id = useId();
  return (
    <div className="flex w-full max-w-md items-start justify-between gap-6">
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium">
          Allow auto-merge
        </label>
        <p id={`${id}-description`} className="text-xs text-muted">
          Pull requests merge by themselves once every check passes
        </p>
      </div>
      <Switch id={id} aria-describedby={`${id}-description`} defaultSelected />
    </div>
  );
}
