"use client";

import { Snippet, toast } from "cennge-ui";

export default function CloneUrl() {
  return (
    <Snippet
      symbol={false}
      codeString="https://github.com/Cennge/payload-cache.git"
      onCopy={(text) => toast("Clone URL copied", { description: text })}
      className="w-full max-w-80"
    >
      github.com/Cennge/payload-cache
    </Snippet>
  );
}
