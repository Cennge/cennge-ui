"use client";

import { useState } from "react";
import { Avatar, Badge, Card, CardBody, CardHeader, Skeleton, Switch } from "cennge-ui";

export default function SkeletonPlate() {
  const [isLoaded, setLoaded] = useState(false);

  return (
    <div className="flex w-full flex-col gap-5">
      <Card aria-busy={!isLoaded} className="w-full">
        <CardHeader>
          <Skeleton isLoaded={isLoaded} className="rounded-full bg-default-bg">
            <Avatar name="Cennge" size="lg" color="primary" />
          </Skeleton>
          <div className="flex min-w-0 flex-col gap-1">
            <Skeleton isLoaded={isLoaded} className="w-fit bg-default-bg">
              <p className="font-semibold">cennge-ui</p>
            </Skeleton>
            <Skeleton isLoaded={isLoaded} className="w-fit bg-default-bg">
              <p className="text-sm text-muted">Cennge / public</p>
            </Skeleton>
          </div>
        </CardHeader>
        <CardBody>
          <Skeleton isLoaded={isLoaded} className="bg-default-bg">
            <p className="text-sm text-muted">React UI library on Radix UI and Tailwind CSS v4, dark first.</p>
          </Skeleton>
          <Skeleton isLoaded={isLoaded} className="w-fit rounded-full bg-default-bg">
            <div className="flex gap-1.5">
              <Badge size="sm">TypeScript</Badge>
              <Badge size="sm">MIT</Badge>
            </div>
          </Skeleton>
        </CardBody>
      </Card>
      <Switch isSelected={isLoaded} onValueChange={setLoaded}>
        Loaded
      </Switch>
    </div>
  );
}
