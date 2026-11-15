// The field marks of every component page, measured rather than written: what its imports cost a bundle
// (the method of scripts/size.mjs, on the built dist/), which tests cover it, and where its source is.
// Writes generated/facts.json. Run the library's `pnpm build` first.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { build } from "esbuild";
import { nav } from "../lib/nav.ts";

const root = resolve(import.meta.dirname, "../..");
const out = resolve(import.meta.dirname, "../generated/facts.json");
if (!existsSync(join(root, "dist/index.js"))) throw new Error("No dist/: run `pnpm build` in the repository root first.");

const entryOf = (family) => (family === "Charts" ? "cennge-ui/charts" : family === "Map" ? "cennge-ui/map" : "cennge-ui");
// The playground's demos are what the Next.js check renders on the server and hydrates (tests/next).
const playground = readdirSync(join(root, "playground"))
  .filter((file) => /^[A-Z]\w*\.tsx$/.test(file))
  .map((file) => readFileSync(join(root, "playground", file), "utf8"))
  .join("\n");
const fixtureSource = (name) => {
  const path = join(root, "playground/fixtures", `${name}.tsx`);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
};
const specs = readdirSync(join(root, "e2e"))
  .filter((file) => file.endsWith(".spec.ts"))
  .map((file) => {
    const text = readFileSync(join(root, "e2e", file), "utf8");
    const fixtures = [...text.matchAll(/openFixture\(page, "([\w-]+)"/g)].map(([, name]) => fixtureSource(name)).join("\n");
    return { file, text, fixtures };
  });
const unitTests = readdirSync(join(root, "src"), { recursive: true })
  .filter((file) => /\.test\.tsx?$/.test(file))
  .map((file) => readFileSync(join(root, "src", file), "utf8"));
const renders = (source, name) => new RegExp(`<${name}[\\s>/]`).test(source);
// Specs that test a component through its role ("checkbox", "radiogroup") rather than by name. Checked by
// reading each spec: the fixture renders the component and the spec presses, reads or audits it.
const testedByRole = {
  checkbox: ["form.spec.ts", "table.spec.ts"],
  radio: ["form.spec.ts"],
  rating: ["form.spec.ts"],
  select: ["form.spec.ts"],
  "area-chart": ["line-chart.spec.ts"],
  "bar-chart": ["chart-references.spec.ts"],
  "line-chart": ["chart-references.spec.ts"],
  "map-routes": ["map.spec.ts", "map-data.spec.ts"],
};

async function gzipOf(names, from) {
  const result = await build({
    stdin: { contents: `import { ${names.join(", ")} } from "${from}"; console.log(${names.join(", ")});`, resolveDir: root, loader: "js" },
    bundle: true,
    minify: true,
    format: "esm",
    platform: "browser",
    write: false,
    logLevel: "error",
    alias: { "cennge-ui/map": join(root, "dist/map.js"), "cennge-ui/charts": join(root, "dist/charts.js"), "cennge-ui": join(root, "dist/index.js") },
    external: ["react", "react-dom", "react/jsx-runtime", "radix-ui", "tailwind-variants", "tailwind-merge", "clsx", "maplibre-gl"],
  });
  return gzipSync(result.outputFiles[0].contents).length;
}

const facts = {};
for (const family of nav) {
  if (family.title === "Getting started") continue;
  const from = entryOf(family.title);
  for (const page of family.pages) {
    const imports = page.imports ?? [page.title];
    const folder =
      from === "cennge-ui/charts" ? "src/charts" : from === "cennge-ui/map" ? "src/map" : `src/components/${page.slug}`;
    const unit =
      (existsSync(join(root, folder)) && readdirSync(join(root, folder)).some((file) => /\.test\.tsx?$/.test(file))) ||
      unitTests.some((text) => imports.some((name) => text.includes(`describe("${name}"`)));
    // The component's own spec, or one that opens a fixture rendering it and names it.
    const own = specs
      .filter(
        ({ file, text, fixtures }) =>
          file === `${page.slug}.spec.ts` ||
          testedByRole[page.slug]?.includes(file) ||
          imports.some((name) => renders(fixtures, name) && new RegExp(`\\b${name}\\b`).test(text)),
      )
      .map(({ file }) => file);
    facts[page.slug] = {
      from,
      imports,
      gzip: imports.length ? await gzipOf(imports, from) : null,
      unit,
      specs: own,
      ssr: imports.length > 0 && new RegExp(`<${imports[0]}[\\s>/]|\\b${imports[0]}\\(`).test(playground),
      source: existsSync(join(root, folder)) ? folder : null,
    };
  }
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(facts, null, 2)}\n`);
console.log(`facts: ${Object.keys(facts).length} component pages -> generated/facts.json`);
