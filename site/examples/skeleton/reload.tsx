"use client";

import { useEffect, useState } from "react";
import { Button, Skeleton } from "cennge-ui";

export default function LatestRelease() {
  const [isLoaded, setLoaded] = useState(true);

  useEffect(() => {
    if (isLoaded) return;
    // Stands in for the request.
    const timer = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div aria-busy={!isLoaded} className="flex flex-col gap-1.5 rounded-large bg-surface-3 p-4">
        <Skeleton isLoaded={isLoaded} className="w-fit bg-default-bg">
          <p className="text-sm text-muted">Latest release</p>
        </Skeleton>
        <Skeleton isLoaded={isLoaded} className="w-fit bg-default-bg">
          <p className="text-2xl font-semibold">cennge-ui 0.3.1</p>
        </Skeleton>
      </div>
      <Button variant="flat" isDisabled={!isLoaded} onClick={() => setLoaded(false)} className="self-start">
        Reload
      </Button>
    </div>
  );
}
