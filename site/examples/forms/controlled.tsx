"use client";

import { useState } from "react";
import { Input, Radio, RadioGroup, Switch } from "cennge-ui";

type Change = "patch" | "minor" | "major";

const current = "0.3.1";

function bump(version: string, change: Change) {
  const [major = 0, minor = 0, patch = 0] = version.split(".").map(Number);
  if (change === "major") return `${major + 1}.0.0`;
  if (change === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

export default function NextVersion() {
  const [change, setChange] = useState<Change>("minor");
  const [version, setVersion] = useState(() => bump(current, "minor"));
  const [isPrerelease, setPrerelease] = useState(false);

  const published = isPrerelease ? `${version}-beta.0` : version;
  const tag = isPrerelease ? "next" : "latest";

  return (
    <div className="flex w-full max-w-96 flex-col gap-5">
      <RadioGroup
        label="Change"
        orientation="horizontal"
        value={change}
        onValueChange={(value) => {
          setChange(value as Change);
          setVersion(bump(current, value as Change));
        }}
      >
        <Radio value="patch">Patch</Radio>
        <Radio value="minor">Minor</Radio>
        <Radio value="major">Major</Radio>
      </RadioGroup>
      <Input label="Version" value={version} onValueChange={setVersion} description={`cennge-ui is at ${current}`} />
      <Switch isSelected={isPrerelease} onValueChange={setPrerelease}>
        Pre-release
      </Switch>
      <p className="text-sm text-muted">
        Publishes <code className="font-mono text-foreground">cennge-ui@{published}</code> under the{" "}
        <code className="font-mono text-foreground">{tag}</code> tag.
      </p>
    </div>
  );
}
