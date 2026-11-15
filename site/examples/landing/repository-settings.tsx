"use client";

import { useState } from "react";
import { Select, SelectItem, Switch } from "cennge-ui";

export default function RepositorySettings() {
  const [runsChecks, setRunsChecks] = useState(true);
  const [publishes, setPublishes] = useState(true);
  const [emails, setEmails] = useState(false);
  const [branch, setBranch] = useState<string | null>("main");

  return (
    <div className="flex w-full flex-col gap-5">
      <Switch isSelected={runsChecks} onValueChange={setRunsChecks}>
        Run CI on pull requests
      </Switch>
      <Switch isSelected={publishes} onValueChange={setPublishes}>
        Publish to npm from main
      </Switch>
      <Switch isSelected={emails} onValueChange={setEmails}>
        Email release notes to dev@example.com
      </Switch>
      <Select label="Default branch" value={branch} onValueChange={setBranch}>
        <SelectItem value="main">main</SelectItem>
        <SelectItem value="next">next</SelectItem>
      </Select>
    </div>
  );
}
