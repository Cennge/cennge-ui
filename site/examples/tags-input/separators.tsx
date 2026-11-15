"use client";

import { TagsInput } from "cennge-ui";

export default function WatchPaths() {
  return (
    <TagsInput
      label="Run CI on changes to"
      defaultValue={["src/**", "e2e/**"]}
      separators={["Enter", ",", " "]}
      placeholder="site/** package.json"
      description="Space, comma or Enter adds a path"
      className="w-full max-w-96"
    />
  );
}
