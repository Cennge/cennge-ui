"use client";

import { Button, EmptyState } from "cennge-ui";

function IssueIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function NoIssues() {
  return (
    <EmptyState
      icon={<IssueIcon />}
      title="No open issues"
      description="Bugs and ideas for ai-niche-scout will collect here."
      actions={
        <>
          <Button color="primary">New issue</Button>
          <Button variant="flat">View closed</Button>
        </>
      }
    />
  );
}
