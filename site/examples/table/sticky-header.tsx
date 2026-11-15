"use client";

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useTableSort } from "cennge-ui";

const jobNames = [
  "Typecheck, test, build",
  "React 17",
  "React 18",
  "React 19",
  "Next.js · server rendering and hydration",
  "Playwright · chromium",
  "Playwright · firefox",
  "Playwright · webkit",
];

interface Job {
  id: string;
  run: number;
  name: string;
  branch: string;
  seconds: number;
}

const jobs: Job[] = Array.from({ length: 4 }, (_, run) =>
  jobNames.map((name, index) => ({
    id: `${214 - run}-${index}`,
    run: 214 - run,
    name,
    branch: run % 2 ? "docs/table" : "main",
    seconds: 40 + ((run * 7 + index * 53) % 260),
  })),
).flat();

const duration = (seconds: number) => (seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`);

type Column = "run" | "name" | "seconds";

export default function CiJobs() {
  const { sortedRows, getSortProps } = useTableSort(jobs, { getValue: (job, column: Column) => job[column] });

  return (
    <Table aria-label="CI jobs" size="sm" isStriped isHeaderSticky classNames={{ wrapper: "max-h-72" }}>
      <TableHeader>
        <TableColumn {...getSortProps("run")}>Run</TableColumn>
        <TableColumn {...getSortProps("name")}>Job</TableColumn>
        <TableColumn>Branch</TableColumn>
        <TableColumn {...getSortProps("seconds")} align="end">
          Took
        </TableColumn>
      </TableHeader>
      <TableBody>
        {sortedRows.map((job) => (
          <TableRow key={job.id} className="whitespace-nowrap">
            <TableCell className="tabular-nums">#{job.run}</TableCell>
            <TableCell>{job.name}</TableCell>
            <TableCell className="font-mono">{job.branch}</TableCell>
            <TableCell align="end" className="tabular-nums">
              {duration(job.seconds)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
