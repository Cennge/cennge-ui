"use client";

import { useState } from "react";
import { Combobox } from "cennge-ui";

const repositories = [
  { value: "cennge-ui", label: "cennge-ui", description: "React UI library" },
  { value: "ai-niche-scout", label: "ai-niche-scout" },
  { value: "payload-cache", label: "payload-cache" },
];

export default function RepositoryPicker() {
  const [repository, setRepository] = useState<string | null>(null);
  return (
    <Combobox
      label="Repository"
      placeholder="Pick a repository"
      items={repositories}
      value={repository}
      onValueChange={setRepository}
      isClearable
      className="w-full max-w-80"
    />
  );
}
