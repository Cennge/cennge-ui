"use client";

import { useState } from "react";
import { CenngeProvider, DatePicker, NumberInput, TimeInput, ToggleGroup, ToggleGroupItem } from "cennge-ui";

const locales = ["en-US", "de-DE", "fr-FR", "ja-JP"];

export default function AlertSettings() {
  const [locale, setLocale] = useState("en-US");
  const [volume, setVolume] = useState<number | null>(1500000);
  const [start, setStart] = useState<string | null>("2026-11-20");
  const [time, setTime] = useState<string | null>("14:30");

  const values = { volume, start, time };

  return (
    <div className="@container flex w-full flex-col gap-5">
      <ToggleGroup aria-label="Locale" size="sm" value={locale} onValueChange={(value) => value && setLocale(value)}>
        {locales.map((item) => (
          <ToggleGroupItem key={item} value={item}>
            {item}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="grid gap-6 @lg:grid-cols-[minmax(0,1fr)_minmax(0,13rem)]">
        <div className="flex flex-col gap-4">
          <CenngeProvider locale={locale}>
            <NumberInput
              label="Minimum 24h volume"
              value={volume}
              onValueChange={setVolume}
              formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
              step={10000}
            />
            <DatePicker label="Alerts from" value={start} onValueChange={setStart} />
            <TimeInput label="Daily report at" value={time} onValueChange={setTime} />
          </CenngeProvider>
        </div>
        <section aria-label="Values" className="flex flex-col gap-3 self-start rounded-large bg-surface-3 p-4">
          <h3 className="text-sm font-semibold">Values</h3>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 font-mono text-[13px]">
            {Object.entries(values).map(([name, value]) => (
              <div key={name} className="contents">
                <dt className="text-muted">{name}</dt>
                <dd>{JSON.stringify(value)}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
