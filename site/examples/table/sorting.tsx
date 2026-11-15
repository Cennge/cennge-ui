"use client";

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useTableSort } from "cennge-ui";

interface Deploy {
  repository: string;
  version: string;
  started: Date;
  /** Null while the deploy is still running. */
  seconds: number | null;
}

const deploys: Deploy[] = [
  { repository: "payload-cache", version: "v1.10.0", started: new Date("2026-11-06T09:12Z"), seconds: 84 },
  { repository: "cennge-ui", version: "v0.3.1", started: new Date("2026-11-01T08:40Z"), seconds: 131 },
  { repository: "ai-niche-scout", version: "v2.4.0", started: new Date("2026-11-07T16:05Z"), seconds: null },
  { repository: "payload-cache", version: "v1.9.2", started: new Date("2026-10-29T13:27Z"), seconds: 79 },
  { repository: "spredo-crypto-screener", version: "v0.9.0", started: new Date("2026-11-04T11:50Z"), seconds: 203 },
];

type Column = keyof Deploy;

const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" });

export default function DeploysTable() {
  const { sortedRows, getSortProps } = useTableSort(deploys, {
    getValue: (deploy, column: Column) => deploy[column],
    defaultSort: { column: "started", direction: "descending" },
  });

  return (
    <Table aria-label="Deploys">
      <TableHeader>
        <TableColumn {...getSortProps("repository")}>Repository</TableColumn>
        <TableColumn {...getSortProps("version")}>Version</TableColumn>
        <TableColumn {...getSortProps("started")}>Started, UTC</TableColumn>
        <TableColumn {...getSortProps("seconds")} align="end">
          Took
        </TableColumn>
      </TableHeader>
      <TableBody>
        {sortedRows.map((deploy) => (
          <TableRow key={deploy.repository + deploy.version} className="whitespace-nowrap">
            <TableCell className="font-medium">{deploy.repository}</TableCell>
            <TableCell className="font-mono text-[13px]">{deploy.version}</TableCell>
            <TableCell className="tabular-nums">{date.format(deploy.started)}</TableCell>
            <TableCell align="end" className="tabular-nums">
              {deploy.seconds === null ? "Running" : `${deploy.seconds} s`}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
