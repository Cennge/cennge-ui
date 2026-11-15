"use client";

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useTableSort } from "cennge-ui";

type Release = { version: string; date: string; summary: string };

const releases: Release[] = [
  { version: "0.3.1", date: "2026-11-01", summary: "README maps set in New York" },
  { version: "0.3.0", date: "2026-10-31", summary: "Charts, ThemeScript, five fixes" },
  { version: "0.2.0", date: "2026-10-21", summary: "The map entry" },
  { version: "0.1.1", date: "2026-10-20", summary: "Date limits accept null" },
  { version: "0.1.0", date: "2026-10-19", summary: "First release" },
];

// The same text on the server and in every time zone.
const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export default function Releases() {
  const { sortedRows, getSortProps } = useTableSort(releases, {
    getValue: (release, column: "version" | "date") => release[column],
    defaultSort: { column: "date", direction: "descending" },
  });

  return (
    <Table aria-label="Releases of cennge-ui" isHoverable>
      <TableHeader>
        <TableColumn {...getSortProps("version")}>Version</TableColumn>
        <TableColumn {...getSortProps("date")}>Released</TableColumn>
        <TableColumn>Change</TableColumn>
      </TableHeader>
      <TableBody>
        {sortedRows.map((release) => (
          <TableRow key={release.version}>
            <TableCell className="font-medium tabular-nums">{release.version}</TableCell>
            <TableCell className="whitespace-nowrap tabular-nums">
              <time dateTime={release.date}>{day.format(new Date(release.date))}</time>
            </TableCell>
            <TableCell className="text-muted">{release.summary}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
