"use client";

import { useState } from "react";
import { Button, DateRangePicker, Form } from "cennge-ui";

export default function CodeFreeze() {
  const [sent, setSent] = useState<string | null>(null);

  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSent(`from=${data.get("from")} to=${data.get("to")}`);
      }}
      className="flex w-full max-w-80 flex-col gap-4"
    >
      <DateRangePicker label="Code freeze" startName="from" endName="to" isRequired />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" color="primary">
          Save
        </Button>
        {sent ? <code className="font-code text-sm text-muted">{sent}</code> : null}
      </div>
    </Form>
  );
}
