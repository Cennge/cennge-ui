"use client";

import { useState } from "react";
import { Button, NumberInput } from "cennge-ui";

export default function BudgetForm() {
  const [submitted, setSubmitted] = useState("");

  return (
    <form
      className="flex w-full max-w-80 flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
      }}
    >
      <NumberInput
        label="Budget"
        name="budget"
        defaultValue={12000}
        min={0}
        max={20000}
        formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
        description="Up to $20,000"
      />
      <Button type="submit" className="self-start">
        Save
      </Button>
      {submitted ? <p className="font-mono text-[13px] text-muted">submitted: {submitted}</p> : null}
    </form>
  );
}
