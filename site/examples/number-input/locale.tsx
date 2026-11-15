"use client";

import { useState } from "react";
import { NumberInput } from "cennge-ui";

export default function EuroPrice() {
  const [price, setPrice] = useState<number | null>(1234.5);

  return (
    <div className="flex w-full max-w-80 flex-col gap-2">
      <NumberInput
        label="Price"
        locale="de-DE"
        min={0}
        formatOptions={{ style: "currency", currency: "EUR" }}
        value={price}
        onValueChange={setPrice}
        description="Type 2499,9 and leave the field"
      />
      <p className="font-mono text-[13px] text-muted">value: {String(price)}</p>
    </div>
  );
}
