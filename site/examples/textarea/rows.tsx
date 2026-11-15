"use client";

import { Textarea } from "cennge-ui";

const why = [
  "Dark-first, tactile look.",
  "Recolour without a rebuild.",
  "Updates instead of copy-paste.",
  "Accessible by default.",
  "Light on dependencies.",
  "Server Components ready.",
].join("\n");

export default function ReadmeSection() {
  return (
    <Textarea
      label="Why cennge-ui"
      minRows={2}
      maxRows={4}
      defaultValue={why}
      description="Two rows when empty, four at most; scroll for the rest"
      className="w-full max-w-md"
    />
  );
}
