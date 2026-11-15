"use client";

import { useRef, useState } from "react";
import {
  Badge,
  Button,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  ToggleGroup,
  ToggleGroupItem,
} from "cennge-ui";

interface Run {
  job: string;
  passed: boolean;
}

const runs: Run[] = [
  { job: "Typecheck, test, build", passed: true },
  { job: "Playwright · chromium", passed: true },
  { job: "Playwright · firefox", passed: true },
  { job: "Playwright · webkit", passed: true },
];

type Filter = "all" | "failed";

// Stands in for the request.
const fetchRuns = (filter: Filter) =>
  new Promise<Run[]>((resolve) => setTimeout(() => resolve(filter === "failed" ? runs.filter((run) => !run.passed) : runs), 900));

export default function RunsWithStates() {
  const [filter, setFilter] = useState<Filter>("all");
  const [rows, setRows] = useState(runs);
  const [isLoading, setLoading] = useState(false);
  const request = useRef(0);

  const load = async (next: Filter, keepRows: boolean) => {
    const id = ++request.current;
    setFilter(next);
    setLoading(true);
    if (!keepRows) setRows([]);
    const result = await fetchRuns(next);
    if (id !== request.current) return;
    setRows(result);
    setLoading(false);
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup aria-label="Show" size="sm" value={filter} onValueChange={(value) => value && load(value as Filter, false)}>
          <ToggleGroupItem value="all">All jobs</ToggleGroupItem>
          <ToggleGroupItem value="failed">Failed</ToggleGroupItem>
        </ToggleGroup>
        <Button size="sm" variant="flat" isDisabled={isLoading} onClick={() => load(filter, true)}>
          Refresh
        </Button>
      </div>
      <Table aria-label="Jobs of cennge-ui run 214" isLoading={isLoading}>
        <TableHeader>
          <TableColumn>Job</TableColumn>
          <TableColumn align="end">Result</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={<EmptyState size="sm" title="No failed jobs" description="Every job in this run passed." />}
        >
          {rows.map((run) => (
            <TableRow key={run.job}>
              <TableCell>{run.job}</TableCell>
              <TableCell align="end">
                <Badge size="sm" color={run.passed ? "success" : "danger"}>
                  {run.passed ? "Passed" : "Failed"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
