"use client";

import { useState } from "react";
import { Badge, Button, Tabs, TabsContent, TabsList, TabsTrigger } from "cennge-ui";

const commits = ["Add a spread alert per pair", "Read the alert threshold from settings", "Test the alert on a stale price"];

const checks = [
  { name: "lint", status: "Passed", color: "success" },
  { name: "test", status: "Passed", color: "success" },
  { name: "build", status: "Running", color: "warning" },
] as const;

export default function PullRequestTabs() {
  const [tab, setTab] = useState("conversation");

  return (
    <Tabs value={tab} onValueChange={setTab} variant="underlined" color="primary" className="w-full max-w-md">
      <TabsList aria-label="Pull request">
        <TabsTrigger value="conversation">Conversation</TabsTrigger>
        <TabsTrigger value="commits">Commits</TabsTrigger>
        <TabsTrigger value="checks">Checks</TabsTrigger>
      </TabsList>
      <TabsContent value="conversation" className="flex flex-col items-start gap-3 text-sm">
        <p>Spread alerts for spredo-crypto-screener: one threshold per pair, read from settings.</p>
        <Button size="sm" variant="flat" onClick={() => setTab("checks")}>
          See the checks
        </Button>
      </TabsContent>
      <TabsContent value="commits">
        <ul className="flex flex-col gap-2 text-sm">
          {commits.map((commit) => (
            <li key={commit}>{commit}</li>
          ))}
        </ul>
      </TabsContent>
      <TabsContent value="checks">
        <ul className="flex flex-col gap-2 text-sm">
          {checks.map((check) => (
            <li key={check.name} className="flex items-center justify-between gap-4">
              <code className="font-code">{check.name}</code>
              <Badge size="sm" variant="dot" color={check.color}>
                {check.status}
              </Badge>
            </li>
          ))}
        </ul>
      </TabsContent>
    </Tabs>
  );
}
