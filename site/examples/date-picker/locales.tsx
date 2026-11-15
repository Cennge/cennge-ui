"use client";

import { useState } from "react";
import { DatePicker } from "cennge-ui";

const locales = ["en-US", "en-GB", "ja-JP"];

export default function OneDateThreeLocales() {
  const [date, setDate] = useState<string | null>("2026-11-19");

  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {locales.map((locale) => (
        <DatePicker key={locale} label={locale} locale={locale} value={date} onValueChange={setDate} />
      ))}
    </div>
  );
}
