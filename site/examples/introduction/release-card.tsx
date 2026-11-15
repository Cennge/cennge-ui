"use client";

import { useState } from "react";
import { Badge, Button, Card, CardBody, CardFooter, CardHeader, Input, Select, SelectItem, Switch, toast } from "cennge-ui";

export default function ReleaseCard() {
  const [version, setVersion] = useState("1.4.0");
  const [tag, setTag] = useState<string | null>("latest");
  const [isPublishing, setPublishing] = useState(false);

  async function publish() {
    setPublishing(true);
    // Stands in for the real request.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setPublishing(false);
    toast.success("Published", { description: `payload-cache@${version} is on npm as ${tag}` });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-start justify-between">
        <div className="min-w-0">
          <h3 className="font-semibold">payload-cache</h3>
          <p className="text-sm text-muted">New release</p>
        </div>
        <Badge color="success" variant="dot">
          CI passing
        </Badge>
      </CardHeader>
      <CardBody className="gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input variant="faded" label="Version" value={version} onValueChange={setVersion} />
          <Select variant="faded" label="Tag" value={tag} onValueChange={setTag}>
            <SelectItem value="latest">latest</SelectItem>
            <SelectItem value="next">next</SelectItem>
          </Select>
        </div>
        <Switch defaultSelected>Publish with provenance</Switch>
      </CardBody>
      <CardFooter className="justify-end">
        <Button color="primary" variant="shadow" isLoading={isPublishing} isDisabled={!version || !tag} onClick={publish}>
          {isPublishing ? "Publishing" : "Publish"}
        </Button>
      </CardFooter>
    </Card>
  );
}
