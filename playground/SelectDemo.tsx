import { useState, type ReactNode } from "react";
import { Badge, Combobox, Select, SelectGroup, SelectItem, SelectSeparator, type ComboboxItem } from "cennge-ui";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-large bg-surface-2 p-6 shadow-raised">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

function Dot({ className }: { className: string }) {
  return <span aria-hidden="true" className={`size-2.5 rounded-full ${className}`} />;
}

const repos: ComboboxItem[] = [
  { value: "cennge-ui", label: "cennge-ui", description: "React UI library · TypeScript", startContent: <Dot className="bg-info" /> },
  { value: "ai-niche-scout", label: "ai-niche-scout", description: "AI startup idea validator · TypeScript", startContent: <Dot className="bg-info" /> },
  { value: "spredo-crypto-screener", label: "spredo-crypto-screener", description: "Crypto screener · TypeScript", startContent: <Dot className="bg-info" /> },
  { value: "payload-cache", label: "payload-cache", description: "FastAPI cache service · Python", startContent: <Dot className="bg-warning" /> },
  { value: "playwright-msi-scraper", label: "playwright-msi-scraper", description: "Product scraper · JavaScript", startContent: <Dot className="bg-amber-300" /> },
  { value: "traffic-analytics-dashboard", label: "traffic-analytics-dashboard", description: "Analytics dashboard · Python", startContent: <Dot className="bg-warning" /> },
  { value: "java-webapp-jsp", label: "java-webapp-jsp", description: "Archived", startContent: <Dot className="bg-danger" />, isDisabled: true },
];

const topics: ComboboxItem[] = [
  "react", "typescript", "tailwindcss", "radix-ui", "design-system", "nextjs", "fastapi", "python", "playwright", "dark-mode",
].map((t) => ({ value: t, label: t }));

export function SelectDemo() {
  const [language, setLanguage] = useState<string | null>("ts");
  const [repo, setRepo] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["react", "tailwindcss"]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Section title="Select">
        <div className="flex flex-col gap-4">
          <Select
            label="Основной язык"
            value={language}
            onValueChange={setLanguage}
            isClearable
            description={language ? `Выбрано: ${language}` : "Ничего не выбрано"}
          >
            <SelectGroup label="Frontend">
              <SelectItem value="ts" description="cennge-ui, ai-niche-scout">
                TypeScript
              </SelectItem>
              <SelectItem value="js">JavaScript</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup label="Backend">
              <SelectItem value="py">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp" isDisabled>
                C++ (скоро)
              </SelectItem>
            </SelectGroup>
          </Select>
          <Select label="Видимость" variant="bordered" placeholder="Выберите" isRequired>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </Select>
          <Select label="Ветка" variant="faded" size="sm" defaultValue="main" isInvalid errorMessage="Ветка защищена">
            <SelectItem value="main">main</SelectItem>
            <SelectItem value="dev">dev</SelectItem>
          </Select>
        </div>
      </Section>

      <Section title="Combobox">
        <div className="flex flex-col gap-4">
          <Combobox
            label="Репозиторий"
            placeholder="Начните вводить…"
            items={repos}
            value={repo}
            onValueChange={setRepo}
            isClearable
            emptyContent="Репозиторий не найден"
            description="Стрелки, Enter, Esc — всё с клавиатуры"
          />
          <p className="text-sm text-muted">
            Выбрано: {repo ? <Badge size="sm" color="primary">{repo}</Badge> : "—"}
          </p>
        </div>
      </Section>

      <Section title="MultiSelect">
        <Combobox
          selectionMode="multiple"
          label="Topics"
          placeholder="Добавьте топики"
          items={topics}
          values={selectedTopics}
          onValuesChange={setSelectedTopics}
          isClearable
          variant="bordered"
          description={`${selectedTopics.length} выбрано · Backspace удаляет последний`}
        />
      </Section>
    </div>
  );
}
