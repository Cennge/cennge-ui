"use client";

import { Badge, Button, Card, CardBody, CardFooter, CardHeader } from "cennge-ui";

const others = [
  { name: "payload-cache", description: "FastAPI cache service" },
  { name: "ai-niche-scout", description: "Finds niches worth building for" },
];

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z" strokeLinejoin="round" />
    </svg>
  );
}

export default function CardPlate() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Card>
        <CardHeader>
          <div aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-medium bg-primary-bg text-lg font-bold text-primary-text">
            C
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">cennge-ui</p>
            <p className="truncate text-sm text-muted">Cennge / public</p>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-muted">React UI library on Radix UI and Tailwind CSS v4: dark first, one accent to swap.</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge size="sm" variant="dot" color="info">
              TypeScript
            </Badge>
            <Badge size="sm">MIT</Badge>
          </div>
        </CardBody>
        <CardFooter>
          <Button asChild size="sm" color="primary">
            <a href="https://github.com/Cennge/cennge-ui">Open on GitHub</a>
          </Button>
          <Button size="sm" variant="flat" isIconOnly aria-label="Star cennge-ui">
            <StarIcon />
          </Button>
        </CardFooter>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        {others.map((repository) => (
          <Card key={repository.name} asChild isPressable variant="bordered">
            <a href={`https://github.com/Cennge/${repository.name}`}>
              <CardBody>
                <span className="font-semibold">{repository.name}</span>
                <span className="text-sm text-muted">{repository.description}</span>
              </CardBody>
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}
