"use client";

import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useTableSort } from "cennge-ui";
import changelog from "@/generated/releases.json";

type Release = { version: string; date: string; summary: string };

// The five latest, from the library's CHANGELOG.md at build time.
const releases: Release[] = changelog.slice(0, 5).map((release) => ({ version: release.version, date: release.date ?? "", summary: release.title }));

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
              {release.date ? <time dateTime={release.date}>{day.format(new Date(release.date))}</time> : "–"}
            </TableCell>
            <TableCell className="text-muted">{release.summary}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
