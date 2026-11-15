"use client";

import { useState } from "react";
import { Combobox } from "cennge-ui";

const repositories = [
  { value: "cennge-ui", label: "cennge-ui", description: "React UI library" },
  { value: "ai-niche-scout", label: "ai-niche-scout", description: "Finds niches worth building for" },
  { value: "payload-cache", label: "payload-cache", description: "FastAPI cache service" },
  { value: "spredo-crypto-screener", label: "spredo-crypto-screener", description: "Crypto screener" },
  { value: "playwright-msi-scraper", label: "playwright-msi-scraper", description: "Scraper on Playwright" },
];

const topics = ["react", "typescript", "tailwindcss", "radix-ui", "playwright", "nextjs"].map((topic) => ({ value: topic, label: topic }));

export default function ComboboxPlate() {
  const [repository, setRepository] = useState<string | null>("cennge-ui");
  const [selected, setSelected] = useState<string[]>(["react", "typescript"]);

  return (
    <>
      <Combobox
        label="Repository"
        items={repositories}
        value={repository}
        onValueChange={setRepository}
        isClearable
        className="w-full max-w-88"
      />
      <Combobox
        selectionMode="multiple"
        label="Topics"
        items={topics}
        values={selected}
        onValuesChange={setSelected}
        className="w-full max-w-88"
      />
    </>
  );
}
