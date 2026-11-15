"use client";

import { Slider } from "cennge-ui";

const levels = ["Error", "Warning", "Info", "Debug"].map((label, value) => ({ value, label }));

export default function LogLevel() {
  return <Slider label="Log level" defaultValue={1} min={0} max={3} marks={levels} className="w-full max-w-96" />;
}
