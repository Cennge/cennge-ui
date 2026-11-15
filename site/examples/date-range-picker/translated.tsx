"use client";

import { CenngeProvider, DateRangePicker, type DateRangePickerError } from "cennge-ui";

const asGerman = (iso?: string) => (iso ? iso.split("-").reverse().join(".") : "");

const errorText = (error: DateRangePickerError) => {
  switch (error.type) {
    case "invalid":
      return "Datum als TT.MM.JJJJ eingeben";
    case "order":
      return "Das Ende liegt vor dem Anfang";
    case "unavailable":
      return `Der ${asGerman(error.date)} ist nicht verfügbar`;
    case "outOfRange":
      return `Daten zwischen ${asGerman(error.min)} und ${asGerman(error.max)} wählen`;
  }
};

export default function GermanRangePicker() {
  return (
    <CenngeProvider locale="de-DE">
      <DateRangePicker
        label="Wartungsfenster"
        minValue="2026-11-01"
        maxValue="2027-03-31"
        placeholder="TT.MM.JJJJ"
        formatError={errorText}
        labels={{
          chooseDates: "Daten wählen",
          start: "Anfang",
          end: "Ende",
          previousMonth: "Vorheriger Monat",
          nextMonth: "Nächster Monat",
          month: "Monat",
          year: "Jahr",
        }}
        className="w-full max-w-80"
      />
    </CenngeProvider>
  );
}
