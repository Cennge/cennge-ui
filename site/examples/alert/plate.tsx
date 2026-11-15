"use client";

import { useState } from "react";
import { Alert, Button } from "cennge-ui";

export default function AlertPlate() {
  const [showFailure, setShowFailure] = useState(true);

  return (
    <div className="flex w-full flex-col gap-3">
      {showFailure ? (
        <Alert
          color="danger"
          variant="faded"
          title="Build failed on main"
          description="The typecheck job in payload-cache exited with code 2."
          isClosable
          onClose={() => setShowFailure(false)}
        />
      ) : (
        <Button size="sm" variant="flat" className="self-start" onClick={() => setShowFailure(true)}>
          Show the build alert again
        </Button>
      )}
      <Alert
        color="warning"
        variant="solid"
        title="The deploy key expires in 3 days"
        endContent={
          <Button size="sm">Renew</Button>
        }
      />
      <Alert color="success" title="cennge-ui@0.3.1 is on npm" description="Released from GitHub Actions." />
    </div>
  );
}
