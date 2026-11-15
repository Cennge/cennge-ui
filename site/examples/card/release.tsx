"use client";

import { Badge, Button, Card, CardBody, CardFooter, CardHeader } from "cennge-ui";

const changes = [
  "Charts, in a new entry: cennge-ui/charts",
  "ThemeScript, useTheme and ThemeSwitch: the theme before the first paint",
  "The pointer cursor on buttons, and the wait cursor while one loads",
];

export default function ReleaseCard() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-start">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">cennge-ui 0.3.0</h3>
          <time dateTime="2026-10-31" className="text-sm text-muted">
            Oct 31, 2026
          </time>
        </div>
        <Badge size="sm" color="primary" className="ml-auto">
          Minor
        </Badge>
      </CardHeader>
      <CardBody>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted">
          {changes.map((change) => (
            <li key={change}>{change}</li>
          ))}
        </ul>
      </CardBody>
      <CardFooter>
        <Button asChild size="sm" variant="flat">
          <a href="https://github.com/Cennge/cennge-ui/blob/main/CHANGELOG.md">Changelog</a>
        </Button>
        <Button asChild size="sm" variant="light">
          <a href="https://www.npmjs.com/package/cennge-ui/v/0.3.0">npm</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
