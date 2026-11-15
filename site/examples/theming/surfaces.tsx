"use client";

import { Badge, Card, CardBody, CardHeader, ToggleGroup, ToggleGroupItem } from "cennge-ui";

function Token({ children }: { children: string }) {
  return <code className="rounded-small bg-default-bg px-1.5 py-0.5 font-mono text-xs text-muted">{children}</code>;
}

function Layer({ name, token }: { name: string; token: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-muted">{name}</span>
      <Token>{token}</Token>
    </div>
  );
}

export default function Surfaces() {
  return (
    <div className="flex w-full flex-col gap-3 rounded-large border border-border bg-surface-1 p-3 sm:p-4">
      <Layer name="Page" token="bg-surface-1" />
      <div className="flex flex-col gap-3 rounded-large bg-surface-2 p-3 sm:p-4">
        <Layer name="Panel" token="bg-surface-2" />
        <Card>
          <CardHeader className="items-start justify-between">
            <div className="min-w-0">
              <p className="font-semibold">payload-cache</p>
              <p className="text-sm text-muted">Deploy from main</p>
            </div>
            <Token>bg-surface-3</Token>
          </CardHeader>
          <CardBody className="flex-row flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <ToggleGroup aria-label="Environment" size="sm" defaultValue="production">
                <ToggleGroupItem value="production">Production</ToggleGroupItem>
                <ToggleGroupItem value="preview">Preview</ToggleGroupItem>
              </ToggleGroup>
              <Badge color="success" variant="dot">
                Ready
              </Badge>
            </div>
            <span className="flex items-center gap-2 text-xs text-muted">
              Selected segment <Token>bg-surface-4</Token>
            </span>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
