"use client";

import { Badge, Tabs, TabsContent, TabsList, TabsTrigger } from "cennge-ui";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.75" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function RepositoryTabs() {
  return (
    <Tabs defaultValue="code" className="w-full max-w-md">
      <TabsList aria-label="payload-cache">
        <TabsTrigger value="code">Code</TabsTrigger>
        <TabsTrigger value="issues">
          Issues
          <Badge size="sm">4</Badge>
        </TabsTrigger>
        <TabsTrigger value="pulls">
          Pull requests
          <Badge size="sm">1</Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="code" className="flex items-center gap-2 pt-3 text-sm">
        payload-cache@1.4.0
        <Badge color="success" size="sm" startContent={<CheckIcon />}>
          Latest
        </Badge>
      </TabsContent>
      <TabsContent value="issues" className="pt-3 text-sm text-muted">
        Four open issues.
      </TabsContent>
      <TabsContent value="pulls" className="pt-3 text-sm text-muted">
        One open pull request.
      </TabsContent>
    </Tabs>
  );
}
