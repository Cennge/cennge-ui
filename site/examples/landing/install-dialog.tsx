"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, CardBody, CardFooter, CardHeader, Snippet, ToggleGroup, ToggleGroupItem } from "cennge-ui";

const frameworks = {
  next: { label: "Next.js", file: "app/globals.css" },
  vite: { label: "Vite", file: "src/index.css" },
};
type Framework = keyof typeof frameworks;

export default function InstallDialog() {
  const [framework, setFramework] = useState<Framework>("next");
  const chosen = frameworks[framework];

  return (
    <Card role="group" aria-labelledby="install-title" className="w-full max-w-110">
      <CardHeader className="flex flex-col items-start gap-1">
        <h3 id="install-title" className="text-lg font-semibold">
          Add cennge-ui to an app
        </h3>
        <p className="text-sm text-muted">React 17, 18 or 19 with Tailwind CSS v4.</p>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <ToggleGroup
          aria-label="Framework"
          value={framework}
          onValueChange={(value) => value && setFramework(value as Framework)}
          fullWidth
        >
          {(Object.keys(frameworks) as Framework[]).map((key) => (
            <ToggleGroupItem key={key} value={key}>
              {frameworks[key].label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Snippet>npm install cennge-ui</Snippet>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">In {chosen.file}:</p>
          <Snippet symbol={false}>{'@import "tailwindcss";\n@import "cennge-ui/styles.css";'}</Snippet>
        </div>
      </CardBody>
      <CardFooter>
        <Button asChild color="primary" size="lg" fullWidth>
          <Link href="/docs/installation/">Install cennge-ui</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
