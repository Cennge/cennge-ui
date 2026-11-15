"use client";

import { Button, EmptyState } from "cennge-ui";

export default function NoResults() {
  return (
    <EmptyState
      variant="bordered"
      size="sm"
      title="No workflow runs match these filters"
      description="Branch: feat/charts · Status: failed · Last 7 days"
      actions={
        <Button size="sm" variant="flat">
          Clear filters
        </Button>
      }
      className="max-w-md"
    />
  );
}
