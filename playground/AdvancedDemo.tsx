import { useState, type ReactNode } from "react";
import {
  NumberInput,
  Button,
  Input,
  Select,
  SelectItem,
  Step,
  Stepper,
  Timeline,
  TimelineItem,
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
  const [step, setStep] = useState(1);

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
      <Section title="Stepper">
        <div className="flex flex-col gap-4">
          <Stepper
            activeStep={step}
            onStepClick={setStep}
            aria-label="Новый репозиторий"
            completedContent={<p className="text-sm text-success-text">Репозиторий cennge-ui создан</p>}
          >
            <Step title="Репозиторий" description="Владелец и имя">
              <Input label="Имя" defaultValue="cennge-ui" />
            </Step>
            <Step title="Настройки" description="Видимость">
              <Select label="Видимость" defaultValue="public">
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </Select>
            </Step>
            <Step title="Готово">
              <p className="text-sm text-muted">Проверьте настройки и создайте репозиторий.</p>
            </Step>
          </Stepper>
          <div className="flex gap-2">
            <Button variant="flat" isDisabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              Назад
            </Button>
            <Button color="primary" isDisabled={step >= 3} onClick={() => setStep((s) => s + 1)}>
              {step === 2 ? "Создать" : "Далее"}
            </Button>
          </div>
        </div>
      </Section>
      <Section title="Timeline">
        <div className="flex flex-col gap-8">
          <Timeline aria-label="Релизы cennge-ui">
            <TimelineItem title="v0.3.0" time="ноябрь" lineVariant="dashed" color="secondary">
              DatePicker и Table — в планах
            </TimelineItem>
            <TimelineItem title="Select, Combobox, MultiSelect" time="18 окт" dateTime="2026-10-18">
              Ввод с поиском и множественный выбор
            </TimelineItem>
            <TimelineItem title="CI упал" time="18 окт, 15:10" dateTime="2026-10-18T15:10" color="danger">
              typecheck: ошибка в toggle-group.tsx
            </TimelineItem>
            <TimelineItem title="Первый коммит" time="18 окт" dateTime="2026-10-18" />
          </Timeline>
          <Timeline aria-label="Путь pull request" orientation="horizontal" activeIndex={1} color="success" size="sm">
            <TimelineItem title="Открыт" time="10:02" />
            <TimelineItem title="Ревью" time="10:40" />
            <TimelineItem title="CI" />
            <TimelineItem title="Смержен" />
          </Timeline>
        </div>
      </Section>
      {/* next */}
    </div>
  );
}
