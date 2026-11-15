"use client";

import { CenngeProvider, DatePicker, type DatePickerError } from "cennge-ui";

const asGerman = (iso?: string) => (iso ? iso.split("-").reverse().join(".") : "");

const errorText = (error: DatePickerError) => {
  switch (error.type) {
    case "invalid":
      return "Datum als TT.MM.JJJJ eingeben";
    case "unavailable":
      return "An diesem Tag nicht möglich";
    case "outOfRange":
      return `Datum zwischen ${asGerman(error.min)} und ${asGerman(error.max)} wählen`;
  }
};

export default function GermanDatePicker() {
  return (
    <CenngeProvider locale="de-DE">
      <DatePicker
        label="Veröffentlichung"
        minValue="2026-11-01"
        maxValue="2026-12-31"
        placeholder="TT.MM.JJJJ"
        formatError={errorText}
        labels={{
          chooseDate: "Datum wählen",
          previousMonth: "Vorheriger Monat",
          nextMonth: "Nächster Monat",
          month: "Monat",
          year: "Jahr",
        }}
        className="w-full max-w-64"
      />
    </CenngeProvider>
  );
}
