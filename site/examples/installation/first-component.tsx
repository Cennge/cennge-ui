"use client";

import { Button } from "cennge-ui";

export default function FirstComponent() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild color="primary" variant="shadow" size="lg">
        <a href="https://www.npmjs.com/package/cennge-ui">cennge-ui on npm</a>
      </Button>
      <Button asChild variant="flat" size="lg">
        <a href="https://github.com/Cennge/cennge-ui">Source on GitHub</a>
      </Button>
    </div>
  );
}
