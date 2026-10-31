// What a consumer's bundler takes from the package for typical imports (run after the build).
// Dependencies (Radix, tailwind-variants…) are left out: this measures cennge-ui's own code.
import { gzipSync } from "node:zlib";
import { build } from "esbuild";

const cases = [
  // [what is imported, the most gzip bytes it may cost]
  // Limits leave ~30% room above today's sizes (Button 2.1 KB; all of it 68 KB). Before the split build,
  // importing Button alone cost 57 KB: these catch that coming back.
  [["Button"], 3_000],
  [["Input"], 4_500],
  [["Dialog", "DialogContent", "DialogTrigger"], 2_500],
  [["Combobox"], 9_000],
  [["DatePicker"], 13_500],
  [["Table", "TableBody", "TableCell", "TableColumn", "TableHeader", "TableRow"], 3_500],
  [["*"], 90_000],
  // The map's own code (9.4 KB with the base map's palette; 12 KB for every layer); maplibre-gl itself is
  // the app's, fetched only when a map mounts.
  [["Map", "MapMarker", "MapPopup", "MapControls", "MapRoute"], 12_500, "cennge-ui/map"],
  [["*"], 15_500, "cennge-ui/map"],
  // The charts draw their own SVG, no chart library underneath (BarChart with its frame: 5.2 KB).
  [["BarChart"], 7_000, "cennge-ui/charts"],
  [["*"], 7_000, "cennge-ui/charts"],
];

let failed = false;
for (const [names, limit, from = "cennge-ui"] of cases) {
  const contents =
    names[0] === "*" ? `import * as all from "${from}"; console.log(all);` : `import { ${names.join(", ")} } from "${from}"; console.log(${names.join(", ")});`;
  const result = await build({
    stdin: { contents, resolveDir: process.cwd(), loader: "js" },
    bundle: true,
    minify: true,
    format: "esm",
    platform: "browser",
    write: false,
    logLevel: "error",
    alias: { "cennge-ui/map": "./dist/map.js", "cennge-ui/charts": "./dist/charts.js", "cennge-ui": "./dist/index.js" },
    external: ["react", "react-dom", "react/jsx-runtime", "radix-ui", "tailwind-variants", "tailwind-merge", "clsx", "maplibre-gl"],
  });
  const gzip = gzipSync(result.outputFiles[0].contents).length;
  const label = `${names[0] === "*" ? "everything" : names.join(", ")}${from === "cennge-ui" ? "" : ` (${from})`}`;
  const over = limit > 0 && gzip > limit;
  if (over) failed = true;
  console.log(`${over ? "✗" : "✓"} ${label.padEnd(60)} ${(gzip / 1024).toFixed(1).padStart(6)} KB gzip${limit ? ` (limit ${(limit / 1024).toFixed(1)} KB)` : ""}`);
}
if (failed) {
  console.error("\nAn import grew past its limit: check that tree shaking still works (tsup.config.ts).");
  process.exit(1);
}
