import { useState, type ReactNode } from "react";
import { Calendar } from "cennge-ui";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-large bg-surface-2 p-6 shadow-raised">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

const calendarLabels = { previousMonth: "Предыдущий месяц", nextMonth: "Следующий месяц", month: "Месяц", year: "Год" };

const isoToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const isWeekend = (iso: string) => {
  const day = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
};

function Calendars() {
  const [release, setRelease] = useState<string | null>(null);
  const formatted = release
    ? new Intl.DateTimeFormat("ru-RU", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${release}T00:00:00Z`))
    : "не выбрана";

  return (
    <div className="flex flex-wrap gap-8">
      <div className="flex flex-col gap-3">
        <Calendar aria-label="Дата релиза" value={release} onValueChange={setRelease} labels={calendarLabels} />
        <p className="text-sm text-muted">Релиз v1.0: {formatted}</p>
      </div>
      <div className="flex flex-col gap-3">
        <Calendar
          aria-label="День для созвона"
          minValue={isoToday()}
          isDateUnavailable={isWeekend}
          color="secondary"
          labels={calendarLabels}
        />
        <p className="text-sm text-muted">Созвон: только будни, начиная с сегодня</p>
      </div>
    </div>
  );
}

export function DatesDemo() {
  return (
    <Section title="Calendar">
      <Calendars />
    </Section>
  );
}
