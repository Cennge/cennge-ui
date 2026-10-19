import { useEffect, useState, type ReactNode } from "react";
import { Button, type CenngeColor, type CenngeRadius, type CenngeSize, type CenngeVariant } from "cennge-ui";
import { ComponentsDemo } from "./ComponentsDemo";
import { MoreDemo } from "./MoreDemo";
import { SelectDemo } from "./SelectDemo";
import { LayoutDemo } from "./LayoutDemo";
import { BasicsDemo } from "./BasicsDemo";
import { AdvancedDemo } from "./AdvancedDemo";
import { RepositoryDemo } from "./RepositoryDemo";
import { AccountDemo } from "./AccountDemo";
import { DatesDemo } from "./DatesDemo";

const colors: CenngeColor[] = ["default", "primary", "secondary", "success", "warning", "danger", "info"];
const variants: CenngeVariant[] = ["solid", "shadow", "bordered", "flat", "faded", "light", "ghost"];
const sizes: CenngeSize[] = ["sm", "md", "lg"];
const radii: CenngeRadius[] = ["none", "sm", "md", "lg", "full"];
const accents = ["orange", "blue", "green", "violet", "red"] as const;

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-large bg-surface-2 p-6 shadow-raised">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

export function App() {
  const [dark, setDark] = useState(true);
  const [accent, setAccent] = useState<(typeof accents)[number]>("orange");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.dataset.accent = accent;
  }, [dark, accent]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">cennge-ui</h1>
          <p className="text-muted">Песочница компонентов</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {accents.map((a) => (
            <Button
              key={a}
              size="sm"
              variant={accent === a ? "solid" : "faded"}
              color={accent === a ? "primary" : "default"}
              onClick={() => setAccent(a)}
            >
              {a}
            </Button>
          ))}
          <Button size="sm" variant="bordered" onClick={() => setDark((d) => !d)}>
            {dark ? "Светлая тема" : "Тёмная тема"}
          </Button>
        </div>
      </header>

      <SelectDemo />
      <ComponentsDemo />
      <MoreDemo />
      <LayoutDemo />
      <BasicsDemo />
      <AdvancedDemo />
      <RepositoryDemo />
      <AccountDemo />
      <DatesDemo />

      <Section title="Button: цвета × варианты">
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-2">
            <thead>
              <tr>
                <th />
                {colors.map((c) => (
                  <th key={c} className="text-left text-xs font-medium text-muted">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v}>
                  <td className="pr-2 text-xs font-medium text-muted">{v}</td>
                  {colors.map((c) => (
                    <td key={c}>
                      <Button color={c} variant={v}>
                        Button
                      </Button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Размеры">
          <div className="flex flex-wrap items-center gap-3">
            {sizes.map((s) => (
              <Button key={s} size={s} color="primary">
                Size {s}
              </Button>
            ))}
            {sizes.map((s) => (
              <Button key={`icon-${s}`} size={s} color="primary" variant="flat" isIconOnly aria-label="Добавить">
                <PlusIcon />
              </Button>
            ))}
          </div>
        </Section>

        <Section title="Скругления">
          <div className="flex flex-wrap items-center gap-3">
            {radii.map((r) => (
              <Button key={r} radius={r} color="secondary">
                {r}
              </Button>
            ))}
          </div>
        </Section>

        <Section title="Состояния">
          <div className="flex flex-wrap items-center gap-3">
            <Button color="primary" isLoading>
              Сохраняю
            </Button>
            <Button color="primary" isDisabled>
              Недоступно
            </Button>
            <Button color="primary" variant="bordered" startContent={<PlusIcon />}>
              С иконкой
            </Button>
            <Button color="danger" variant="flat" isIconOnly isLoading aria-label="Удаление" />
          </div>
        </Section>

        <Section title="asChild + fullWidth">
          <div className="flex flex-col gap-3">
            <Button asChild color="info" variant="flat">
              <a href="#top">Ссылка в стиле кнопки</a>
            </Button>
            <Button color="primary" variant="shadow" fullWidth size="lg">
              Скачать
            </Button>
          </div>
        </Section>
      </div>
    </main>
  );
}
