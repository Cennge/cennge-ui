"use client";

import { useState } from "react";
import { NumberInput } from "cennge-ui";

export default function RateLimit() {
  const [limit, setLimit] = useState<number | null>(null);

  return (
    <div className="flex w-full max-w-80 flex-col gap-2">
      <NumberInput
        label="Requests per minute"
        placeholder="No limit"
        min={1}
        step={10}
        value={limit}
        onValueChange={setLimit}
        description="Leave it empty for no limit"
      />
      <p className="font-mono text-[13px] text-muted">value: {String(limit)}</p>
    </div>
  );
}
