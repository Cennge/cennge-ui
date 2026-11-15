"use client";

import { Spinner } from "cennge-ui";

export default function SpinnerLabel() {
  return (
    <div className="flex w-full flex-wrap items-center gap-x-10 gap-y-6">
      {/* The text says what is happening: the spinner stays hidden from screen readers. */}
      <p className="flex items-center gap-2 text-sm text-muted">
        <Spinner />
        Syncing 3 forks
      </p>
      {/* Nothing else says it: the label makes it a status. */}
      <div className="grid h-28 w-full max-w-xs place-items-center rounded-large bg-surface-3">
        <Spinner size="lg" color="primary" label="Loading the changelog" />
      </div>
    </div>
  );
}
