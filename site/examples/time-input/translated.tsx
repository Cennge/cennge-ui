"use client";

import { CenngeProvider, TimeInput, type TimeInputError } from "cennge-ui";

const errorText = (error: TimeInputError) =>
  error.type === "invalid" ? "Uhrzeit als HH:MM eingeben" : `Nur zwischen ${error.min} und ${error.max} Uhr`;

export default function GermanTime() {
  return (
    // de-DE writes times on a 24-hour clock, so the field does too.
    <CenngeProvider locale="de-DE">
      <TimeInput
        label="Wartung ab"
        minValue="22:00"
        maxValue="23:45"
        step={15}
        formatError={errorText}
        className="w-full max-w-56"
      />
    </CenngeProvider>
  );
}
