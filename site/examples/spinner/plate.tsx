"use client";

import { Spinner } from "cennge-ui";

type JobState = "done" | "running" | "queued";

const jobs: { name: string; state: JobState }[] = [
  { name: "Typecheck", state: "done" },
  { name: "Unit tests", state: "running" },
  { name: "End-to-end, WebKit", state: "running" },
  { name: "Build", state: "queued" },
];

const stateText: Record<JobState, string> = { done: "Passed", running: "Running", queued: "Queued" };

function StateIcon({ state }: { state: JobState }) {
  if (state === "running") return <Spinner color="primary" />;
  return (
    <svg viewBox="0 0 24 24" className={state === "done" ? "size-4 text-success" : "size-4 text-muted"} fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      {state === "done" ? <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" /> : <circle cx="12" cy="12" r="7.5" />}
    </svg>
  );
}

export default function SpinnerPlate() {
  return (
    <div className="flex w-full flex-col gap-5">
      <ul className="flex flex-col rounded-large bg-surface-3 py-1.5">
        {jobs.map((job) => (
          <li key={job.name} className="flex items-center gap-3 px-4 py-2.5 text-sm">
            <StateIcon state={job.state} />
            <span className="font-medium">{job.name}</span>
            <span className="ml-auto text-muted">{stateText[job.state]}</span>
          </li>
        ))}
      </ul>
      <p className="flex items-center gap-2 text-sm font-medium text-primary-text">
        <Spinner />
        Deploying payload-cache to production
      </p>
      <div className="rounded-large border border-border">
        <p className="border-b border-border px-4 py-2.5 text-sm font-medium">Releases</p>
        <div className="grid h-20 place-items-center">
          <Spinner size="lg" color="default" label="Loading releases" />
        </div>
      </div>
    </div>
  );
}
