"use client";

import { Calendar, CenngeProvider } from "cennge-ui";

export default function GermanCalendar() {
  return (
    // Month and weekday names and the first day of the week come from Intl for this locale.
    <CenngeProvider locale="de-DE">
      <Calendar
        aria-label="Veröffentlichung"
        defaultValue="2026-12-03"
        labels={{ previousMonth: "Vorheriger Monat", nextMonth: "Nächster Monat", month: "Monat", year: "Jahr" }}
      />
    </CenngeProvider>
  );
}
