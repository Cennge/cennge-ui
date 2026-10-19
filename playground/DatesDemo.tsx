import { useState, type ReactNode } from "react";
import { Calendar, DatePicker, DateRangePicker, type DatePickerError, type DateRange, type DateRangePickerError } from "cennge-ui";

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

const ruDate = (iso: string) =>
  new Intl.DateTimeFormat("ru-RU", { timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

const dateError = (error: DatePickerError) => {
  switch (error.type) {
    case "invalid":
      return "Введите дату в формате ДД.ММ.ГГГГ";
    case "unavailable":
      return "В этот день нельзя";
    case "outOfRange":
      if (error.min && error.max) return `Выберите дату с ${ruDate(error.min)} по ${ruDate(error.max)}`;
      return error.min ? `Не раньше ${ruDate(error.min)}` : `Не позже ${ruDate(error.max ?? "")}`;
  }
};

const pickerLabels = { ...calendarLabels, chooseDate: "Выбрать дату" };

function DatePickers() {
  const [deadline, setDeadline] = useState<string | null>(null);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <DatePicker
        label="Дедлайн релиза"
        value={deadline}
        onValueChange={setDeadline}
        minValue={isoToday()}
        isDateUnavailable={isWeekend}
        description={deadline ? `В формате ISO: ${deadline}` : "Только будни, начиная с сегодня"}
        placeholder="ДД.ММ.ГГГГ"
        formatError={dateError}
        labels={pickerLabels}
      />
      <DatePicker
        label="Дата рождения"
        maxValue={isoToday()}
        variant="bordered"
        description="Можно ввести 07031994 или выбрать год в календаре"
        placeholder="ДД.ММ.ГГГГ"
        formatError={dateError}
        labels={pickerLabels}
      />
    </div>
  );
}

const rangeError = (error: DateRangePickerError) =>
  error.type === "order" ? "Конец раньше начала" : dateError(error);

const addDaysIso = (iso: string, days: number) => {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

function RangePickers() {
  const [sprint, setSprint] = useState<DateRange | null>(null);
  const days = sprint
    ? Math.round((Date.parse(`${sprint.end}T00:00:00Z`) - Date.parse(`${sprint.start}T00:00:00Z`)) / 86_400_000) + 1
    : 0;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <DateRangePicker
        label="Спринт"
        value={sprint}
        onValueChange={setSprint}
        minValue={isoToday()}
        maxValue={addDaysIso(isoToday(), 120)}
        description={sprint ? `${days} дн., ${sprint.start} — ${sprint.end}` : "В ближайшие 120 дней"}
        placeholder="ДД.ММ.ГГГГ"
        formatError={rangeError}
        labels={{ ...calendarLabels, chooseDates: "Выбрать даты", start: "Начало", end: "Конец" }}
      />
      <DateRangePicker
        label="Отпуск"
        variant="bordered"
        color="success"
        isDateUnavailable={(iso) => iso.endsWith("-12-31")}
        description="Через 31 декабря не выбрать: офис закрыт"
        placeholder="ДД.ММ.ГГГГ"
        formatError={rangeError}
        labels={{ ...calendarLabels, chooseDates: "Выбрать даты", start: "Начало", end: "Конец" }}
      />
    </div>
  );
}

export function DatesDemo() {
  return (
    <div className="grid gap-6">
      <Section title="DatePicker">
        <DatePickers />
      </Section>
      <Section title="DateRangePicker">
        <RangePickers />
      </Section>
      <Section title="Calendar">
        <Calendars />
      </Section>
    </div>
  );
}
