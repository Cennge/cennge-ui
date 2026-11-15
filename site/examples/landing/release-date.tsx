"use client";

import { useState } from "react";
import { Calendar } from "cennge-ui";

export default function ReleaseDate() {
  const [date, setDate] = useState<string | null>("2026-11-13");

  return <Calendar value={date} onValueChange={setDate} />;
}
