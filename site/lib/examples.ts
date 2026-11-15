import { readFileSync } from "node:fs";
import { join } from "node:path";

/** An example's source as a reader would copy it: without the "use client" line the docs need. */
export function exampleSource(file: string): string {
  const source = readFileSync(join(process.cwd(), "examples", `${file}.tsx`), "utf8").replaceAll("\r\n", "\n");
  return source.replace(/^["']use client["'];?\n+/, "");
}
