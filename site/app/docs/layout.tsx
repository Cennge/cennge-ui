import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";
import { DocsShell } from "@/components/docs-shell";

// The version the docs describe: the library's own package.json, read at build time.
const { version } = JSON.parse(readFileSync(join(process.cwd(), "../package.json"), "utf8")) as { version: string };

export default function DocsLayout({ children }: { children: ReactNode }) {
  return <DocsShell version={version}>{children}</DocsShell>;
}
