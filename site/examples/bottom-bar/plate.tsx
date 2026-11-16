"use client";

import { useState } from "react";
import { BottomBar, Button } from "cennge-ui";

const jobs = ["typecheck", "unit", "e2e (chromium)", "e2e (firefox)", "e2e (webkit)", "build", "size", "publish"];

export default function RunJobs() {
  const [done, setDone] = useState(3);

  return (
    <div className="flex h-[30rem] w-full max-w-[22rem] flex-col overflow-hidden rounded-[1.75rem] border border-border bg-surface-1">
      <div className="flex-1 overflow-y-auto">
        <h3 className="px-5 pt-5 text-xl font-semibold">Release cennge-ui</h3>
        <ol className="flex flex-col p-3">
          {jobs.map((job, i) => (
            <li key={job} className="flex items-center justify-between rounded-medium px-2 py-2.5 text-sm">
              <span className={i < done ? "text-muted line-through" : undefined}>{job}</span>
              <span className="text-xs text-muted">{i < done ? "done" : i === done ? "next" : ""}</span>
            </li>
          ))}
        </ol>
        <BottomBar position="sticky">
          <span className="text-sm text-muted tabular-nums">
            {done} of {jobs.length}
          </span>
          <Button color="primary" className="ml-auto" isDisabled={done === jobs.length} onClick={() => setDone((value) => value + 1)}>
            {done === jobs.length ? "All done" : `Run ${jobs[done]}`}
          </Button>
        </BottomBar>
      </div>
    </div>
  );
}
