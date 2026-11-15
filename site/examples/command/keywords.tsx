"use client";

import { Command, CommandItem, toast } from "cennge-ui";

const settings = [
  { name: "Branch protection", description: "Rules for main", keywords: ["main", "review", "merge"] },
  { name: "Deploy keys", description: "Read-only access for servers", keywords: ["ssh"] },
  { name: "Webhooks", description: "Events sent to other services", keywords: ["http", "events"] },
  { name: "Collaborators", description: "People with access", keywords: ["invite", "team", "access"] },
  { name: "Secrets", description: "Values for CI runs", keywords: ["token", "env", "npm"] },
];

export default function SettingsSearch() {
  return (
    <Command
      label="Repository settings"
      placeholder="Try ssh, invite or npm token"
      className="w-full max-w-sm rounded-large border border-border bg-surface-3"
    >
      {settings.map((setting) => (
        <CommandItem
          key={setting.name}
          description={setting.description}
          keywords={setting.keywords}
          onAction={() => toast(setting.name)}
        >
          {setting.name}
        </CommandItem>
      ))}
    </Command>
  );
}
