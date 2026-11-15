// Next.js 16 exports a page's prefetch segments as nested folders (docs/x/__next.docs/x/__PAGE__.txt) while
// its router asks for one dotted name (docs/x/__next.docs.x.__PAGE__.txt). A static host answers 404 and
// every link prefetch fails. This copies each nested segment file to the name the router asks for.
// node scripts/flatten-segments.mjs  (from site/, after `next build`)
import { copyFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const out = resolve(import.meta.dirname, "../out");
let copied = 0;

function filesIn(folder) {
  return readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    return statSync(path).isDirectory() ? filesIn(path) : [path];
  });
}

function walk(folder) {
  for (const name of readdirSync(folder)) {
    const path = join(folder, name);
    if (!statSync(path).isDirectory()) continue;
    if (name.startsWith("__next.")) {
      for (const file of filesIn(path)) {
        copyFileSync(file, join(folder, relative(folder, file).split(sep).join(".")));
        copied += 1;
      }
    } else walk(path);
  }
}

walk(out);
console.log(`segments: ${copied} prefetch files copied to their flat names`);
