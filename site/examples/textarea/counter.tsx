"use client";

import { useState } from "react";
import { Textarea } from "cennge-ui";

const limit = 160;

export default function RepositoryDescription() {
  const [description, setDescription] = useState("Crypto project screener: FastAPI + CoinGecko backend, Next.js + shadcn/ui frontend");
  const over = description.length - limit;

  return (
    <Textarea
      label="Description"
      minRows={2}
      value={description}
      onValueChange={setDescription}
      description={`${description.length} / ${limit}`}
      isInvalid={over > 0}
      errorMessage={`${over} ${over === 1 ? "character" : "characters"} over the limit`}
      className="w-full max-w-md"
    />
  );
}
