"use client";

import { Button, EmptyState, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "cennge-ui";

interface Release {
  tag: string;
  date: string;
}

const releases: Release[] = [];

export default function ReleasesTable() {
  return (
    <Table aria-label="Releases of payload-cache" className="w-full">
      <TableHeader>
        <TableColumn>Tag</TableColumn>
        <TableColumn>Published</TableColumn>
      </TableHeader>
      <TableBody
        emptyContent={
          <EmptyState
            size="sm"
            title="No releases yet"
            description="Tag a commit on main to publish the first one."
            actions={
              <Button size="sm" variant="flat">
                Draft a release
              </Button>
            }
          />
        }
      >
        {releases.map((release) => (
          <TableRow key={release.tag}>
            <TableCell>{release.tag}</TableCell>
            <TableCell>{release.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
