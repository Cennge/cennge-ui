import { useState } from "react";
import { Combobox, Select, SelectItem, type ComboboxItem } from "cennge-ui";

const repos: ComboboxItem[] = [
  { value: "cennge-ui", label: "cennge-ui", description: "React UI library" },
  { value: "ai-niche-scout", label: "ai-niche-scout" },
  { value: "payload-cache", label: "payload-cache", isDisabled: true },
  { value: "spredo-crypto-screener", label: "spredo-crypto-screener" },
  { value: "playwright-msi-scraper", label: "playwright-msi-scraper" },
];

const topics: ComboboxItem[] = ["react", "typescript", "tailwindcss", "radix-ui", "playwright"].map((t) => ({
  value: t,
  label: t,
}));

export default function ComboboxFixture() {
  const [repo, setRepo] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>(["react"]);
  const [language, setLanguage] = useState<string | null>(null);

  return (
    <>
      <Combobox label="Repository" items={repos} value={repo} onValueChange={setRepo} isClearable emptyContent="No repository" />
      <p>
        repo: <span data-testid="repo">{repo ?? "none"}</span>
      </p>

      <Combobox selectionMode="multiple" label="Topics" items={topics} values={selected} onValuesChange={setSelected} />
      <p>
        topics: <span data-testid="topics">{selected.join("|")}</span>
      </p>

      <Select label="Language" placeholder="Pick a language" value={language} onValueChange={setLanguage} isClearable>
        <SelectItem value="ts">TypeScript</SelectItem>
        <SelectItem value="py">Python</SelectItem>
        <SelectItem value="java">Java</SelectItem>
        <SelectItem value="cpp" isDisabled>
          C++
        </SelectItem>
      </Select>
      <p>
        language: <span data-testid="language">{language ?? "none"}</span>
      </p>
    </>
  );
}
