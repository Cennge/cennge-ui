"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useTableSelection,
  useTableSort,
  type CenngeColor,
} from "cennge-ui";

type Status = "passed" | "failed" | "running";

interface Run {
  id: string;
  repository: string;
  number: number;
  branch: string;
  status: Status;
  /** Null while the run is still going. */
  seconds: number | null;
}

const initialRuns: Run[] = [
  { id: "cennge-ui-214", repository: "cennge-ui", number: 214, branch: "main", status: "passed", seconds: 412 },
  { id: "payload-cache-88", repository: "payload-cache", number: 88, branch: "fix/ttl", status: "failed", seconds: 96 },
  { id: "spredo-crypto-screener-131", repository: "spredo-crypto-screener", number: 131, branch: "main", status: "running", seconds: null },
  { id: "ai-niche-scout-57", repository: "ai-niche-scout", number: 57, branch: "main", status: "passed", seconds: 238 },
  { id: "playwright-msi-scraper-23", repository: "playwright-msi-scraper", number: 23, branch: "deps", status: "failed", seconds: 171 },
];

const statusColor: Record<Status, CenngeColor> = { passed: "success", failed: "danger", running: "warning" };
const statusLabel: Record<Status, string> = { passed: "Passed", failed: "Failed", running: "Running" };

const duration = (seconds: number | null) => (seconds === null ? "—" : `${Math.floor(seconds / 60)}m ${seconds % 60}s`);

type Column = "repository" | "status" | "seconds";

export default function TablePlate() {
  const [runs, setRuns] = useState(initialRuns);
  const { sortedRows, getSortProps } = useTableSort(runs, { getValue: (run, column: Column) => run[column] });
  const selection = useTableSelection(sortedRows.map((run) => run.id));
  const count = selection.selected.size;

  const rerun = () => {
    setRuns((current) =>
      current.map((run) => (selection.isSelected(run.id) ? { ...run, status: "running", seconds: null } : run)),
    );
    selection.clear();
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex min-h-8 items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {count ? `${count} of ${runs.length} selected` : `${runs.length} workflow runs`}
        </p>
        <Button size="sm" variant="flat" color="primary" isDisabled={!count} onClick={rerun}>
          Re-run
        </Button>
      </div>
      <Table aria-label="Workflow runs" isHoverable>
        <TableHeader>
          <TableColumn className="w-10">
            <Checkbox
              aria-label="Select all runs"
              isSelected={selection.allSelected}
              isIndeterminate={selection.someSelected}
              onValueChange={selection.toggleAll}
            />
          </TableColumn>
          <TableColumn {...getSortProps("repository")}>Run</TableColumn>
          <TableColumn {...getSortProps("status")}>Status</TableColumn>
          <TableColumn {...getSortProps("seconds")} align="end">
            Duration
          </TableColumn>
        </TableHeader>
        <TableBody>
          {sortedRows.map((run) => (
            <TableRow key={run.id} isSelected={selection.isSelected(run.id)} className="whitespace-nowrap">
              <TableCell>
                <Checkbox
                  aria-label={`Select ${run.repository} #${run.number}`}
                  isSelected={selection.isSelected(run.id)}
                  onValueChange={() => selection.toggle(run.id)}
                />
              </TableCell>
              <TableCell>
                <span className="block font-medium">{run.repository}</span>
                <span className="block text-xs text-muted">
                  #{run.number} on {run.branch}
                </span>
              </TableCell>
              <TableCell>
                <Badge size="sm" color={statusColor[run.status]}>
                  {statusLabel[run.status]}
                </Badge>
              </TableCell>
              <TableCell align="end" className="tabular-nums">
                {duration(run.seconds)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
