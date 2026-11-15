"use client";

import { useState } from "react";
import { Button, DatePicker, Form, TimeInput } from "cennge-ui";

export default function ScheduleRelease() {
  const [scheduled, setScheduled] = useState<string | null>(null);

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        // A local date and time, no time zone: add the offset where you know it.
        setScheduled(`${data.get("date")}T${data.get("time")}`);
      }}
      className="flex w-full max-w-96 flex-col gap-4"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_8.5rem] gap-3">
        <DatePicker name="date" label="Publish on" defaultValue="2026-11-19" isRequired />
        <TimeInput name="time" label="At" defaultValue="10:00" step={15} isRequired />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" color="primary">
          Schedule payload-cache
        </Button>
        {scheduled ? <code className="font-code text-sm text-muted">{scheduled}</code> : null}
      </div>
    </Form>
  );
}
