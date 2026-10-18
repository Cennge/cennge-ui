import type { ReactNode } from "react";
import {
  Kbd,
  Separator,
  Button,
  Input,
} from "cennge-ui";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-large bg-surface-2 p-6 shadow-raised">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

export function BasicsDemo() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Section title="Kbd">
        <div className="flex flex-col gap-3 text-sm text-muted">
          <p className="flex items-center gap-2">
            Поиск по репозиторию
            <Kbd keys="command">K</Kbd>
          </p>
          <p className="flex items-center gap-2">
            Новая строка в комментарии
            <Kbd keys={["shift", "enter"]} />
          </p>
          <p className="flex items-center gap-2">
            Навигация по файлам
            <Kbd keys="up" size="sm" />
            <Kbd keys="down" size="sm" />
            <Kbd keys="escape" size="sm" />
          </p>
        </div>
      </Section>
      <Section title="Separator">
        <div className="flex flex-col gap-4">
          <Button variant="faded" fullWidth>
            Войти через GitHub
          </Button>
          <Separator>или</Separator>
          <Input aria-label="Email" placeholder="you@example.com" />
          <div className="flex h-6 items-center gap-3 text-sm text-muted">
            <span>Code</span>
            <Separator orientation="vertical" />
            <span>Issues</span>
            <Separator orientation="vertical" />
            <span>Pull requests</span>
          </div>
        </div>
      </Section>
      {/* next */}
    </div>
  );
}
