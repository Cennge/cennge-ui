"use client";

import { Skeleton } from "cennge-ui";

export default function ReleaseListSkeleton() {
  return (
    <ul aria-busy="true" className="flex w-full max-w-md flex-col gap-5">
      {[0, 1, 2].map((row) => (
        <li key={row} className="flex items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-full bg-default-bg" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/5 bg-default-bg" />
            <Skeleton className="h-3 w-4/5 bg-default-bg" />
          </div>
          <Skeleton className="h-8 w-20 rounded-medium bg-default-bg" />
        </li>
      ))}
    </ul>
  );
}
