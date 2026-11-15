// Compiles MDX pages without a Next.js build, so several authors can check their pages at once.
// node site/scripts/check-mdx.mjs site/app/docs/combobox/page.mdx [...]
import { readFileSync } from "node:fs";
import { compile } from "@mdx-js/mdx";

let failed = false;
for (const file of process.argv.slice(2)) {
  try {
    await compile(readFileSync(file, "utf8"), { jsx: true });
    console.log(`ok   ${file}`);
  } catch (error) {
    failed = true;
    console.log(`FAIL ${file}\n     ${error.message}${error.line ? ` (line ${error.line}:${error.column})` : ""}`);
  }
}
process.exit(failed ? 1 : 0);
