"use client";

import { useState } from "react";
import { Radio, RadioGroup } from "cennge-ui";

const commands: Record<string, string> = {
  pnpm: "pnpm add cennge-ui",
  npm: "npm install cennge-ui",
  yarn: "yarn add cennge-ui",
  bun: "bun add cennge-ui",
};

export default function PackageManager() {
  const [manager, setManager] = useState("pnpm");

  return (
    <div className="flex flex-col gap-4">
      <RadioGroup label="Package manager" orientation="horizontal" value={manager} onValueChange={setManager}>
        {Object.keys(commands).map((name) => (
          <Radio key={name} value={name}>
            {name}
          </Radio>
        ))}
      </RadioGroup>
      <code className="w-fit rounded-medium bg-surface-3 px-3 py-2 font-code text-[13px]">{commands[manager]}</code>
    </div>
  );
}
