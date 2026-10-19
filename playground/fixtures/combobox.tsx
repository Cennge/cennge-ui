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

// Past 100 options the list renders only those in view.
const dependencies: ComboboxItem[] = Array.from({ length: 5000 }, (_, i) => {
  const name = `@cennge/package-${String(i + 1).padStart(4, "0")}`;
  return { value: name, label: name };
});

export default function ComboboxFixture() {
  const [repo, setRepo] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>(["react"]);
  const [language, setLanguage] = useState<string | null>(null);
  const [dependency, setDependency] = useState<string | null>(null);

  return (
    <>
      <Combobox label="Repository" items={repos} value={repo} onValueChange={setRepo} isClearable emptyContent="No repository" />
      <p>
        repo: <span data-testid="repo">{repo ?? "none"}</span>
      </p>

      <Combobox selectionMode="multiple" label="Topics" items={topics} values={selected} onValuesChange={setSelected} />
      <Combobox label="Dependency" items={dependencies} value={dependency} onValueChange={setDependency} />
      <p>
        dependency: <span data-testid="dependency">{dependency ?? "none"}</span>
      </p>
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
