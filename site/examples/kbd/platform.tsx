"use client";

import { useEffect, useState } from "react";
import { Kbd } from "cennge-ui";

export default function SearchHint() {
  // The server cannot know the platform: render Ctrl, then switch after hydration.
  const [isMac, setMac] = useState(false);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);

  return (
    <p className="text-sm text-muted">
      Search the docs from any page with{" "}
      <Kbd keys={isMac ? "command" : "ctrl"} size="sm">
        K
      </Kbd>
      .
    </p>
  );
}
