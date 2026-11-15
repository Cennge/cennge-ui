"use client";

import { useState } from "react";
import { Radio, RadioGroup } from "cennge-ui";

const bumps = [
  { value: "patch", label: "Patch", version: "0.3.2", description: "Fixes only" },
  { value: "minor", label: "Minor", version: "0.4.0", description: "New components or props" },
  { value: "major", label: "Major", version: "1.0.0", description: "Breaking changes" },
];

export default function RadioPlate() {
  const [bump, setBump] = useState("minor");
  const [tag, setTag] = useState("latest");
  const version = bumps.find((item) => item.value === bump)?.version;

  return (
    <div className="flex w-full max-w-xl flex-col gap-7">
      <div className="grid gap-x-10 gap-y-7 sm:grid-cols-[minmax(0,1fr)_auto]">
        <RadioGroup label="Version bump" description="From cennge-ui 0.3.1" value={bump} onValueChange={setBump}>
          {bumps.map((item) => (
            <Radio key={item.value} value={item.value} description={item.description}>
              {item.label}, {item.version}
            </Radio>
          ))}
        </RadioGroup>
        <RadioGroup label="Publish under" orientation="horizontal" value={tag} onValueChange={setTag}>
          <Radio value="latest">latest</Radio>
          <Radio value="next">next</Radio>
        </RadioGroup>
      </div>
      <p className="rounded-medium bg-surface-3 px-4 py-3 font-code text-[13px]">
        npm publish --tag {tag} <span className="text-muted"># cennge-ui@{version}</span>
      </p>
    </div>
  );
}
