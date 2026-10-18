import { useState, type ReactNode } from "react";
import {
  NumberInput,
} from "cennge-ui";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-large bg-surface-2 p-6 shadow-raised">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

export function AdvancedDemo() {
  const [runners, setRunners] = useState<number | null>(4);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Section title="NumberInput">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberInput
            label="Параллельных раннеров"
            value={runners}
            onValueChange={setRunners}
            min={1}
            max={20}
            description={runners === null ? "Не задано" : `Значение: ${runners}`}
          />
          <NumberInput
            label="Бюджет на CI"
            locale="ru-RU"
            defaultValue={1500}
            min={0}
            step={100}
            formatOptions={{ style: "currency", currency: "RUB", maximumFractionDigits: 0 }}
          />
          <NumberInput label="Порог покрытия" defaultValue={0.8} min={0} max={1} formatOptions={{ style: "percent" }} variant="bordered" />
          <NumberInput label="Масштаб" defaultValue={1} step={0.1} min={0.5} max={3} variant="faded" endContent={<span className="text-muted">×</span>} />
        </div>
      </Section>
      {/* next */}
    </div>
  );
}
