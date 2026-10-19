import { useState } from "react";
import { Calendar } from "cennge-ui";

const isWeekend = (iso: string) => {
  const day = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
};

export default function CalendarFixture() {
  const [value, setValue] = useState<string>("2026-10-19");

  return (
    <div className="flex flex-wrap items-start gap-8">
      <div className="flex flex-col gap-2">
        <Calendar aria-label="Release date" value={value} onValueChange={setValue} locale="en-US" />
        <p>
          value: <span data-testid="value">{value}</span>
        </p>
      </div>
      <Calendar
        aria-label="Meeting"
        defaultValue="2026-10-21"
        minValue="2026-10-05"
        maxValue="2026-11-20"
        isDateUnavailable={isWeekend}
        locale="en-GB"
        color="secondary"
        size="sm"
      />
      <Calendar aria-label="Дата релиза" defaultValue="2026-10-19" locale="ru-RU" size="lg" />
    </div>
  );
}
